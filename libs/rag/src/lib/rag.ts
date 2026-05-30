import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { getLangChainModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { logger } from '@ai-enhanced-web-apps/logger';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { FakeEmbeddings, FakeListChatModel } from '@langchain/core/utils/testing';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service class handling the Aviation incident safety database index construction and query execution.
 * Integrates local HNSWLib vector storage with Google Cloud Vertex AI embeddings and model generation.
 */
export class AviationRAG {
  private embeddings: Embeddings;
  private llm?: BaseChatModel;

  /**
   * Initializes the AviationRAG service.
   * Accepts optional injected dependencies for embeddings and chat model (LLM),
   * falling back to default Vertex AI implementations (or Fake implementations in test mode).
   * 
   * @param config - Optional configuration object containing custom dependencies.
   */
  constructor(config?: { embeddings?: Embeddings; llm?: BaseChatModel }) {
    if (config?.embeddings) {
      this.embeddings = config.embeddings;
    } else if (process.env.NODE_ENV === 'test') {
      this.embeddings = new FakeEmbeddings();
    } else {
      const project = process.env.VERTEX_AI_PROJECT_ID;
      const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
      this.embeddings = new VertexAIEmbeddings({
        model: 'text-embedding-004',
        authOptions: {
          projectId: project,
        },
        location: location,
      });
    }

    if (config?.llm) {
      this.llm = config.llm;
    }
  }

  /**
   * Reads, parses, and splits NTSB incident report PDFs, computes text embeddings,
   * and saves the serialized HNSWLib vector index to the specified disk path.
   * 
   * @param docsDir - Path to the directory containing NTSB PDF files.
   * @param saveDir - Path where the computed vector store files should be serialized on disk.
   * @returns A promise resolving when the index is successfully generated and stored.
   * @throws {@link Error} If documents directory is not found, or if zero PDF files are indexed.
   */
  async buildIndex(docsDir: string, saveDir: string): Promise<void> {
    logger.info('[AviationRAG] Starting index build...');
    logger.info(`[AviationRAG] Source documents: "${docsDir}"`);
    logger.info(`[AviationRAG] Index output target: "${saveDir}"`);

    if (!fs.existsSync(docsDir)) {
      throw new Error(`Documents directory not found at: "${docsDir}"`);
    }

    const files = fs.readdirSync(docsDir).filter((file) => file.endsWith('.pdf'));
    logger.info(`[AviationRAG] Found ${files.length} PDF files to process.`);

    if (files.length === 0) {
      throw new Error('No PDF files found to index.');
    }

    const allDocs = [];
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    for (const file of files) {
      const filePath = path.join(docsDir, file);
      logger.info(`[AviationRAG] Loading PDF: "${file}"...`);
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      const splitDocs = await splitter.splitDocuments(docs);
      
      // Add source file name metadata to each chunk
      splitDocs.forEach((doc) => {
        doc.metadata = {
          ...doc.metadata,
          sourceFile: file,
        };
      });

      allDocs.push(...splitDocs);
      logger.info(`[AviationRAG] Loaded "${file}" (${docs.length} pages, split into ${splitDocs.length} chunks).`);
    }

    logger.info(`[AviationRAG] Creating HNSWLib vector store from ${allDocs.length} total text chunks...`);
    const vectorStore = await HNSWLib.fromDocuments(allDocs, this.embeddings);

    logger.info(`[AviationRAG] Saving index to disk at "${saveDir}"...`);
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }
    await vectorStore.save(saveDir);
    logger.info('[AviationRAG] Index successfully saved!');
  }

  /**
   * Queries the local HNSWLib vector store, retrieves relevant grounded context,
   * and uses Vertex AI Gemini to generate the incident lookup answers.
   * 
   * @param indexPath - Path to the directory where the HNSWLib index is serialized.
   * @param userQuery - Question or search phrase submitted by the user.
   * @returns A promise resolving to the generated assistant answer string.
   * @throws {@link Error} If a valid index configuration (args.json) is not found at the index path.
   */
  private async buildQueryChain(indexPath: string) {
    if (!fs.existsSync(path.join(indexPath, 'args.json'))) {
      throw new Error(`Valid HNSWLib index not found at path: "${indexPath}"`);
    }

    const vectorStore = await HNSWLib.load(indexPath, this.embeddings);
    const retriever = vectorStore.asRetriever({ k: 4 });

    let llm: BaseChatModel;
    if (this.llm) {
      llm = this.llm;
    } else if (process.env.NODE_ENV === 'test') {
      llm = new FakeListChatModel({ responses: ['Fake test response'] });
    } else {
      llm = getLangChainModelInstance('vertex', 'gemini-2.5-flash', {
        temperature: 0,
        maxOutputTokens: 2048,
      });
    }

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are an aviation safety assistant. Answer the user question based on the provided NTSB incident reports context. If you cannot find the answer in the context, say "I cannot find information about this incident in the database."\n\nContext:\n{context}',
      ],
      ['human', '{question}'],
    ]);

    const formatDocs = (docs: Document[]) =>
      docs
        .map(
          (d) =>
            `[Report Source: ${d.metadata.sourceFile || 'Unknown'}]\n${d.pageContent}`
        )
        .join('\n\n---\n\n');

    return RunnableSequence.from([
      {
        context: retriever.pipe(formatDocs),
        question: new RunnablePassthrough(),
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);
  }

  /**
   * Queries the local HNSWLib vector store, retrieves relevant grounded context,
   * and uses Vertex AI Gemini to generate the incident lookup answers.
   * 
   * @param indexPath - Path to the directory where the HNSWLib index is serialized.
   * @param userQuery - Question or search phrase submitted by the user.
   * @returns A promise resolving to the generated assistant answer string.
   * @throws {@link Error} If a valid index configuration (args.json) is not found at the index path.
   */
  async query(indexPath: string, userQuery: string): Promise<string> {
    const chain = await this.buildQueryChain(indexPath);
    logger.info(`[AviationRAG] Executing LCEL sequence for query: "${userQuery}"`);
    return await chain.invoke(userQuery);
  }

  /**
   * Queries the local HNSWLib vector store and returns a LangChain stream of response tokens.
   * 
   * @param indexPath - Path to the directory where the HNSWLib index is serialized.
   * @param userQuery - Question or search phrase submitted by the user.
   * @returns A promise resolving to the LangChain token stream.
   * @throws {@link Error} If a valid index configuration (args.json) is not found at the index path.
   */
  async queryStream(indexPath: string, userQuery: string): Promise<any> {
    const chain = await this.buildQueryChain(indexPath);
    logger.info(`[AviationRAG] Executing LCEL sequence (stream) for query: "${userQuery}"`);
    return await chain.stream(userQuery);
  }
}

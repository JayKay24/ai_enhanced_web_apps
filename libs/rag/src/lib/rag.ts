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
import * as fs from 'fs';
import * as path from 'path';

export class AviationRAG {
  private embeddings: VertexAIEmbeddings;

  constructor() {
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

  /**
   * Reads PDFs from docsDir, splits them, computes embeddings, and builds a new HNSWLib index on disk.
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
   * Queries the vector store index and uses Gemini to synthesize the grounded safety response.
   */
  async query(indexPath: string, userQuery: string): Promise<string> {
    logger.info(`[AviationRAG] Loading index from: "${indexPath}"...`);
    
    if (!fs.existsSync(path.join(indexPath, 'args.json'))) {
      throw new Error(`Valid HNSWLib index not found at path: "${indexPath}"`);
    }

    const vectorStore = await HNSWLib.load(indexPath, this.embeddings);
    const retriever = vectorStore.asRetriever({ k: 4 });

    const llm = getLangChainModelInstance('vertex', 'gemini-2.5-flash', {
      temperature: 0,
      maxOutputTokens: 2048,
    });

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

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocs),
        question: new RunnablePassthrough(),
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    logger.info(`[AviationRAG] Executing LCEL sequence for query: "${userQuery}"`);
    return await chain.invoke(userQuery);
  }
}

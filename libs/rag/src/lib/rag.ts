import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
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
    console.log(`[AviationRAG] Starting index build...`);
    console.log(`[AviationRAG] Source documents: "${docsDir}"`);
    console.log(`[AviationRAG] Index output target: "${saveDir}"`);

    if (!fs.existsSync(docsDir)) {
      throw new Error(`Documents directory not found at: "${docsDir}"`);
    }

    const files = fs.readdirSync(docsDir).filter((file) => file.endsWith('.pdf'));
    console.log(`[AviationRAG] Found ${files.length} PDF files to process.`);

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
      console.log(`[AviationRAG] Loading PDF: "${file}"...`);
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
      console.log(`[AviationRAG] Loaded "${file}" (${docs.length} pages, split into ${splitDocs.length} chunks).`);
    }

    console.log(`[AviationRAG] Creating HNSWLib vector store from ${allDocs.length} total text chunks...`);
    const vectorStore = await HNSWLib.fromDocuments(allDocs, this.embeddings);

    console.log(`[AviationRAG] Saving index to disk at "${saveDir}"...`);
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }
    await vectorStore.save(saveDir);
    console.log(`[AviationRAG] Index successfully saved!`);
  }

  /**
   * Queries the vector store index and uses Gemini to synthesize the grounded safety response.
   */
  async query(indexPath: string, userQuery: string): Promise<string> {
    console.log(`[AviationRAG] Loading index from: "${indexPath}"...`);
    
    if (!fs.existsSync(path.join(indexPath, 'args.json'))) {
      throw new Error(`Valid HNSWLib index not found at path: "${indexPath}"`);
    }

    const vectorStore = await HNSWLib.load(indexPath, this.embeddings);
    const retriever = vectorStore.asRetriever({ k: 4 });

    const project = process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    const llm = new ChatVertexAI({
      model: 'gemini-2.5-flash',
      authOptions: {
        projectId: project,
      },
      location: location,
      temperature: 0,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are an aviation safety assistant. Answer the user question based on the provided NTSB incident reports context. If you cannot find the answer in the context, say "I cannot find information about this incident in the database."\n\nContext:\n{context}',
      ],
      ['human', '{question}'],
    ]);

    const formatDocs = (docs: any[]) =>
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

    console.log(`[AviationRAG] Executing LCEL sequence for query: "${userQuery}"`);
    return await chain.invoke(userQuery);
  }
}

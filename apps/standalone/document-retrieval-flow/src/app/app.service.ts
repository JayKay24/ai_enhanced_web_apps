import { Injectable, Logger } from '@nestjs/common';
import { ChatVertexAI, VertexAIEmbeddings } from '@langchain/google-vertexai';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';

// Simple Helper for formatting documents as string
function formatDocumentsAsString(documents: Document[]): string {
  return documents.map((doc) => doc.pageContent).join('\n\n');
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async demonstrateRetrievalFlow(): Promise<void> {
    this.logger.log('--- Document Embedding and Retrieval Flow (Vertex AI) ---');

    const projectId = process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    if (!projectId) {
      this.logger.error('Error: VERTEX_AI_PROJECT_ID is not set in environment.');
      throw new Error('VERTEX_AI_PROJECT_ID is not set.');
    }

    this.logger.log(`Using Project: "${projectId}", Location: "${location}"`);

    // 1. Raw Text Document
    const rawText = `Artificial Intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals.

As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. For instance, optical character recognition is frequently excluded from things considered to be AI, having become a routine technology. Similarly, advances in machine learning have led to significant improvements in natural language processing and computer vision.

AI applications include advanced web search engines, recommendation systems, understanding human speech (natural language processing), self-driving cars, and competing at a high level in strategic game systems like chess and Go.`;

    // 2. Split Text into Chunks using standard RecursiveCharacterTextSplitter
    const chunkSize = 150;
    const chunkOverlap = 30;
    this.logger.log(`Splitting text into chunks using RecursiveCharacterTextSplitter (size: ${chunkSize}, overlap: ${chunkOverlap})...`);
    
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    
    const documents = await splitter.createDocuments([rawText]);

    this.logger.log(`Generated ${documents.length} chunks:`);
    documents.forEach((doc, i) => {
      this.logger.log(`Chunk [${i + 1}]: "${doc.pageContent}"`);
    });

    // 3. Initialize Embeddings Model (Vertex AI)
    this.logger.log('Initializing Vertex AI Embeddings (text-embedding-004)...');
    const embeddings = new VertexAIEmbeddings({
      model: 'text-embedding-004',
      authOptions: {
        projectId: projectId,
      },
      location: location,
    });

    // 4. Initialize standard MemoryVectorStore and ingest documents
    this.logger.log('Ingesting document embeddings into standard MemoryVectorStore...');
    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(documents);

    // 5. Test Similarity Search directly
    const searchQuery = 'What is the definition of AI?';
    this.logger.log(`Testing similarity search for: "${searchQuery}"`);
    const searchResults = await vectorStore.similaritySearch(searchQuery, 1);
    
    console.log('\n--- Direct Similarity Search Results ---');
    searchResults.forEach((doc, idx) => {
      console.log(`Match ${idx + 1}: "${doc.pageContent}"`);
    });
    console.log('----------------------------------------\n');

    // 6. Set up Chat Model and RAG Retrieval Chain
    this.logger.log('Initializing ChatVertexAI (gemini-2.5-flash)...');
    const model = new ChatVertexAI({
      model: 'gemini-2.5-flash',
      authOptions: {
        projectId: projectId,
      },
      location: location,
      temperature: 0,
    });

    // 7. Define Prompts (using up-to-date ChatPromptTemplate)
    const standaloneQuestionPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Transform the following question into a clear, concise standalone question. Output ONLY the standalone question, nothing else.',
      ],
      ['human', '{question}'],
    ]);

    const answerPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are a friendly and knowledgeable assistant specializing in Artificial Intelligence. Based on the provided context, please answer the following question. If the answer is not found in the context, respond with: "I\'m sorry, I don\'t have that information." Always aim for a conversational tone.',
      ],
      ['human', 'Context:\n{context}\n\nQuestion: {question}'],
    ]);

    // 8. Build the runnable chain
    const standaloneQuestionChain = standaloneQuestionPrompt
      .pipe(model)
      .pipe(new StringOutputParser());

    // Convert vector store to retriever
    const retriever = vectorStore.asRetriever({ k: 1 });

    const retrieverChain = RunnableSequence.from([
      (prevResult: any) => prevResult.standalone_question,
      retriever,
      formatDocumentsAsString,
    ]);

    const answerChain = answerPrompt
      .pipe(model)
      .pipe(new StringOutputParser());

    const ragChain = RunnableSequence.from([
      {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough(),
      },
      {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
      },
      answerChain,
    ]);

    // 9. Run the RAG Chain on test inputs
    const query1 = 'What is artificial intelligence?';
    this.logger.log(`Invoking RAG chain for query 1: "${query1}"`);
    try {
      const answer1 = await ragChain.invoke({ question: query1 });
      console.log('\n--- RAG Chain Output (Query 1) ---');
      console.log(`Question: ${query1}`);
      console.log(`Answer:\n${answer1}`);
      console.log('----------------------------------\n');
    } catch (err) {
      this.logger.error('Failed to run Query 1', err);
    }

    const query2 = 'What is the exact date of the first human landing on Mars?';
    this.logger.log(`Invoking RAG chain for query 2 (out-of-context): "${query2}"`);
    try {
      const answer2 = await ragChain.invoke({ question: query2 });
      console.log('\n--- RAG Chain Output (Query 2) ---');
      console.log(`Question: ${query2}`);
      console.log(`Answer:\n${answer2}`);
      console.log('----------------------------------\n');
    } catch (err) {
      this.logger.error('Failed to run Query 2', err);
    }
  }
}

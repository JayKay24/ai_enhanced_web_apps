import { Injectable, Logger } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { getLangChainModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { kmeans } from 'ml-kmeans';
import * as fs from 'fs';

function euclideanDistance(v1: number[], v2: number[]): number {
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow(v1[i] - v2[i], 2);
  }
  return Math.sqrt(sum);
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async runSummarization(pdfPath: string): Promise<void> {
    this.logger.log(`=== Standalone K-Means Clustering Summarizer CLI ===`);
    this.logger.log(`Target document path: ${pdfPath}`);

    // 1. Validate file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`File not found at path: "${pdfPath}"`);
    }

    // 2. Load PDF document
    this.logger.log('Loading PDF pages...');
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    this.logger.log(`Successfully loaded PDF with ${docs.length} pages.`);

    // 3. Chunk the document
    this.logger.log('Chunking document...');
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    this.logger.log(`Split document into ${splitDocs.length} text chunks.`);

    if (splitDocs.length === 0) {
      throw new Error('The document contains no extractable text chunks.');
    }

    // 4. Generate Embeddings using Vertex AI
    this.logger.log('Generating embeddings for all chunks via Vertex AI (text-embedding-004)...');
    const embeddingsService = new VertexAIEmbeddings({
      model: 'text-embedding-004',
    });
    const chunkTexts = splitDocs.map((doc) => doc.pageContent);
    const embeddings = await embeddingsService.embedDocuments(chunkTexts);
    this.logger.log(`Generated ${embeddings.length} embeddings vectors (768 dimensions each).`);

    // 5. Apply K-Means Clustering
    const K = Math.min(5, splitDocs.length);
    this.logger.log(`Running K-Means clustering algorithm to partition into K = ${K} clusters...`);
    const kmeansResult = kmeans(embeddings, K, {});
    this.logger.log('Clustering completed successfully.');

    // 6. Select Representative Chunk Closest to Centroid for Each Cluster
    this.logger.log('Extracting the most representative chunk closest to the centroid of each cluster...');
    const representativeChunks: Document[] = [];
    
    for (let c = 0; c < K; c++) {
      const centroid = kmeansResult.centroids[c];
      let minDistance = Infinity;
      let bestIndex = -1;

      for (let i = 0; i < splitDocs.length; i++) {
        if (kmeansResult.clusters[i] === c) {
          const dist = euclideanDistance(embeddings[i], centroid);
          if (dist < minDistance) {
            minDistance = dist;
            bestIndex = i;
          }
        }
      }

      if (bestIndex !== -1) {
        representativeChunks.push({
          ...splitDocs[bestIndex],
          metadata: {
            ...splitDocs[bestIndex].metadata,
            originalIndex: bestIndex,
            clusterIndex: c,
          },
        });
      }
    }

    // 7. Sort Selected Chunks by Original Reading Order
    representativeChunks.sort((a, b) => a.metadata.originalIndex - b.metadata.originalIndex);
    
    console.log('\n--- Selected Representative Chunks ---');
    representativeChunks.forEach((chunk, index) => {
      console.log(`\n[Representative Chunk #${index + 1} | Cluster #${chunk.metadata.clusterIndex} | Original Chunk #${chunk.metadata.originalIndex}]:`);
      console.log(`"${chunk.pageContent.substring(0, 300)}..."`);
    });
    console.log('-------------------------------------\n');

    // 8. Synthesize Final Summary using LLM (Gemini 2.5 Flash via Vertex AI)
    this.logger.log('Synthesizing final cohesive summary using Gemini 2.5 Flash...');
    const llm = getLangChainModelInstance('vertex', 'gemini-2.5-flash');
    if (!llm) {
      throw new Error('Could not initialize Gemini LLM via Vertex AI.');
    }

    const synthesisPrompt = PromptTemplate.fromTemplate(
      'Write a cohesive and comprehensive summary of the document based on the following key representative sections extracted from it. Keep the summary structured, highlight the main points, and present it clearly:\n\n{text}\n\nCOHESIVE SUMMARY:'
    );
    const chain = synthesisPrompt.pipe(llm).pipe(new StringOutputParser());
    
    const combinedTexts = representativeChunks.map((doc) => doc.pageContent).join('\n\n---\n\n');
    const finalSummary = await chain.invoke({ text: combinedTexts });

    console.log('\n======================================================================');
    console.log('                        FINAL SYNTHESIZED SUMMARY');
    console.log('======================================================================');
    console.log(finalSummary);
    console.log('======================================================================\n');
  }
}

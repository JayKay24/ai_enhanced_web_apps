import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getLangChainModelInstance } from "./ai-providers";

const MAP_PROMPT = PromptTemplate.fromTemplate(
  "Write a concise summary of the following text:\n\n\"{text}\"\n\nCONCISE SUMMARY:"
);

const REDUCE_PROMPT = PromptTemplate.fromTemplate(
  "Write a cohesive and concise summary of the following text, which is a collection of summaries from a larger document:\n\n\"{text}\"\n\nCOHESIVE SUMMARY:"
);

export async function summarizeDocs(
  docs: Document[],
  providerId = 'vertex',
  modelId = 'gemini-2.5-flash'
): Promise<string> {
  const llm = getLangChainModelInstance(providerId, modelId);
  if (!llm) {
    throw new Error(`Could not initialize LangChain model for ${providerId}/${modelId}`);
  }

  // Normalize document content to replace extra newlines and multiple spaces
  const normalizedDocs = docs.map(doc => new Document({
    pageContent: doc.pageContent.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    metadata: doc.metadata
  }));

  // Split documents using text splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(normalizedDocs);

  const mapChain = MAP_PROMPT.pipe(llm).pipe(new StringOutputParser());

  if (splitDocs.length === 1) {
    // Single chunk optimization (stuffing approach)
    return await mapChain.invoke({ text: splitDocs[0].pageContent });
  }

  // Map step: summarize each chunk in parallel
  const chunkSummaries = await Promise.all(
    splitDocs.map(doc => mapChain.invoke({ text: doc.pageContent }))
  );

  // Reduce step: combine chunk summaries and summarize again
  const combinedText = chunkSummaries.join("\n\n");
  const reduceChain = REDUCE_PROMPT.pipe(llm).pipe(new StringOutputParser());

  return await reduceChain.invoke({ text: combinedText });
}

export async function summarizeText(
  text: string,
  providerId = 'vertex',
  modelId = 'gemini-2.5-flash'
): Promise<string> {
  const doc = new Document({ pageContent: text });
  return summarizeDocs([doc], providerId, modelId);
}

export async function processFile(
  fileBlob: Blob,
  fileType: string,
  providerId = 'vertex',
  modelId = 'gemini-2.5-flash'
): Promise<string> {
  let loader;
  if (fileType === 'application/pdf') {
    loader = new PDFLoader(fileBlob);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    loader = new DocxLoader(fileBlob);
  } else {
    throw new Error('Unsupported file type. Only PDF and DOCX documents are supported.');
  }

  const docs = await loader.load();
  return summarizeDocs(docs, providerId, modelId);
}

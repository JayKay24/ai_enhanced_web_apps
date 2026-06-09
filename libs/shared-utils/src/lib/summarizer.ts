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

/**
 * Summarizes an array of LangChain Documents using a Map-Reduce chain workflow.
 * For single documents, optimizes execution using a single-run Stuffing pipeline.
 * For multiple documents or long text, splits the content, maps summaries in parallel, and reduces them into a cohesive summary.
 * 
 * @param docs - Array of LangChain {@link Document} inputs to process.
 * @param providerId - Model provider ID. Defaults to 'vertex'.
 * @param modelId - Target model name. Defaults to 'gemini-2.5-flash'.
 * @returns A promise resolving to the final cohesive summary string.
 * @throws {@link Error} If the model instantiation fails or generation errors out.
 */
export async function summarizeDocs(
  docs: Document[],
  providerId = 'vertex',
  modelId = 'gemini-2.5-flash'
): Promise<string> {
  const llm = getLangChainModelInstance(providerId, modelId);
  if (!llm) {
    throw new Error(`Could not initialize LangChain model for ${providerId}/${modelId}`);
  }

  const normalizedDocs = docs.map(doc => new Document({
    pageContent: doc.pageContent.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    metadata: doc.metadata
  }));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(normalizedDocs);

  const mapChain = MAP_PROMPT.pipe(llm).pipe(new StringOutputParser());

  if (splitDocs.length === 1) {
    return await mapChain.invoke({ text: splitDocs[0].pageContent });
  }

  const chunkSummaries = await Promise.all(
    splitDocs.map(doc => mapChain.invoke({ text: doc.pageContent }))
  );

  const combinedText = chunkSummaries.join("\n\n");
  const reduceChain = REDUCE_PROMPT.pipe(llm).pipe(new StringOutputParser());

  return await reduceChain.invoke({ text: combinedText });
}

/**
 * Generates a concise summary for a raw text input string using the LangChain Map-Reduce pipeline.
 * 
 * @param text - The raw text content to summarize.
 * @param providerId - Sibling provider ID. Defaults to 'vertex'.
 * @param modelId - Target model name. Defaults to 'gemini-2.5-flash'.
 * @returns A promise resolving to the generated summary string.
 */
export async function summarizeText(
  text: string,
  providerId = 'vertex',
  modelId = 'gemini-2.5-flash'
): Promise<string> {
  const doc = new Document({ pageContent: text });
  return summarizeDocs([doc], providerId, modelId);
}

/**
 * Loads, parses, and summarizes a raw file blob (supports PDF and DOCX formats).
 * Delegates text extraction to corresponding document loaders before compiling summaries.
 * 
 * @param fileBlob - Binary blob of the uploaded file.
 * @param fileType - MIME type of the file (application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document).
 * @param providerId - Model provider ID. Defaults to 'vertex'.
 * @param modelId - Target model name. Defaults to 'gemini-2.5-flash'.
 * @returns A promise resolving to the final parsed document summary.
 * @throws {@link Error} If the file type is unsupported or reading/extraction fails.
 */
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

/**
 * Normalizes an array of LangChain Document objects by stripping newlines and consolidating whitespace 
 * within the page content, preserving the original metadata.
 * 
 * @param docs - The array of Document objects to normalize.
 * @returns A new array of Document objects with cleaned whitespace.
 */
function normalizeDocuments(docs: Document[]): Document[] {
  return docs.map(doc => new Document({
    pageContent: doc.pageContent.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    metadata: doc.metadata
  }));
}

/**
 * Generates a stream of the summary for an array of LangChain Document objects using the Map-Reduce pipeline.
 *
 * @param docs - The array of loaded LangChain documents to summarize.
 * @param providerId - Model provider ID. Defaults to 'vertex'.
 * @param modelId - Target model name. Defaults to 'gemini-2.5-flash'.
 * @returns A promise resolving to the final cohesive summary LangChain stream.
 * @throws {@link Error} If the model instantiation fails or generation errors out.
 */
export async function summarizeDocsStream(
  docs: Document[],
  providerId = 'vertex',
  modelId = 'gemini-2.5-flash'
): Promise<any> {
  const llm = getLangChainModelInstance(providerId, modelId);
  if (!llm) {
    throw new Error(`Could not initialize LangChain model for ${providerId}/${modelId}`);
  }

  const normalizedDocs = normalizeDocuments(docs);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitDocuments(normalizedDocs);

  const mapChain = MAP_PROMPT.pipe(llm).pipe(new StringOutputParser());

  if (splitDocs.length === 1) {
    return await mapChain.stream({ text: splitDocs[0].pageContent });
  }

  const chunkSummaries = await Promise.all(
    splitDocs.map(doc => mapChain.invoke({ text: doc.pageContent }))
  );

  const combinedText = chunkSummaries.join("\n\n");
  const reduceChain = REDUCE_PROMPT.pipe(llm).pipe(new StringOutputParser());

  return await reduceChain.stream({ text: combinedText });
}

/**
 * Generates a stream of the summary for a raw text input string using the LangChain Map-Reduce pipeline.
 * 
 * @param text - The raw text content to summarize.
 * @param providerId - Sibling provider ID. Defaults to 'vertex'.
 * @param modelId - Target model name. Defaults to 'gemini-2.5-flash'.
 * @returns A promise resolving to the generated summary stream.
 */
export async function summarizeTextStream(
  text: string,
  providerId = 'vertex',
  modelId = 'gemini-2.5-flash'
): Promise<any> {
  const doc = new Document({ pageContent: text });
  return summarizeDocsStream([doc], providerId, modelId);
}

/**
 * Loads, parses, and summarizes a raw file blob (supports PDF and DOCX formats), returning a stream.
 * Delegates text extraction to corresponding document loaders before compiling summaries.
 * 
 * @param fileBlob - Binary blob of the uploaded file.
 * @param fileType - MIME type of the file.
 * @param providerId - Model provider ID. Defaults to 'vertex'.
 * @param modelId - Target model name. Defaults to 'gemini-2.5-flash'.
 * @returns A promise resolving to the final parsed document summary stream.
 * @throws {@link Error} If the file type is unsupported or reading/extraction fails.
 */
export async function processFileStream(
  fileBlob: Blob,
  fileType: string,
  providerId = 'vertex',
  modelId = 'gemini-2.5-flash'
): Promise<any> {
  let loader;
  if (fileType === 'application/pdf') {
    loader = new PDFLoader(fileBlob);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    loader = new DocxLoader(fileBlob);
  } else {
    throw new Error('Unsupported file type. Only PDF and DOCX documents are supported.');
  }

  const docs = await loader.load();
  return summarizeDocsStream(docs, providerId, modelId);
}


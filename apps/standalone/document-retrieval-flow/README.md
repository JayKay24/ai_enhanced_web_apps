# Document Retrieval & RAG Flow CLI

A standalone NestJS command-line application that demonstrates a complete Retrieval-Augmented Generation (RAG) pipeline using LangChain.js and Google Vertex AI.

## Features
- **Document Chunking**: Splits a raw text document into smaller, manageable chunks using `RecursiveCharacterTextSplitter`.
- **Vertex AI Embeddings**: Vectorizes the document chunks using `VertexAIEmbeddings` (`text-embedding-004`).
- **Vector Ingestion**: Stores the generated embeddings in a standard in-memory `MemoryVectorStore`.
- **Similarity Search**: Performs a vector-based similarity search to retrieve the most contextually relevant chunks.
- **RAG Execution**: Pipes the retrieved context and question to a prompt template and generates a grounded response using Gemini 2.5 Flash via `ChatVertexAI`.

## Prerequisites
Ensure Vertex AI environment variables and Application Default Credentials (ADC) are active:
```bash
gcloud auth application-default login
export VERTEX_AI_PROJECT_ID="your-project-id"
export VERTEX_AI_LOCATION="us-central1"
```

## How to Execute
Run this CLI application once using Nx:
```bash
npx nx execute document-retrieval-flow
```

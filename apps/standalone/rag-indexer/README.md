# Astra Aviation RAG Indexer

I built this standalone NestJS CLI application to build and serialize the vector search index for the **Astra Aviation RAG** application.

## Core Features

- **Co-location of Dataset**: Copies PDF reports from the raw NTSB dataset to local indexer assets for processing.
- **Document Loading & Splitting**: Loads PDF documents using LangChain `PDFLoader` and splits them into manageable chunks using `RecursiveCharacterTextSplitter`.
- **Vector Embeddings**: Generates vector representations using Google Vertex AI's `text-embedding-004` model.
- **Local Index Storage**: Builds and serializes a local hierarchical navigable small world (HNSW) vector database using `HNSWLib` (`hnswlib-node`).
- **On-Demand Building**: Can be run as a CLI tool whenever you need to re-index the source PDFs.

## How to Run

Before running, ensure that your Google Cloud authentication is configured with Application Default Credentials (ADC), and the following environment variables are set:
- `VERTEX_AI_PROJECT_ID`
- `VERTEX_AI_LOCATION` (defaults to `us-central1` if not provided)

To build and run the indexer on demand:

```bash
# Compile the indexer
npm exec nx build rag-indexer

# Execute the indexer
npx nx execute rag-indexer
```

The indexer will copy all `.pdf` documents from the dataset directory, vectorize them, and serialize the index to `apps/astra-aviation-rag/src/assets/hnswlib-index` where the web app can access it.

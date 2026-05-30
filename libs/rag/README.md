# `@ai-enhanced-web-apps/rag`

A shared Retrieval-Augmented Generation (RAG) library designed for aviation safety report retrieval and analysis. It combines hierarchical navigable small world (HNSW) vector indexing with Google Vertex AI generative chains.

## Key Features

- **HNSWLib Vector Store**: Utilizes local file-based vector stores via `hnswlib-node` for extremely fast semantic retrieval without database hosting costs.
- **LangChain Expression Language (LCEL)**: Formulates structured query pipelines using a `RunnableSequence` of document retrievers, prompts, model instances, and output string parsers.
- **PDF Extraction**: Extracts text chunks from PDF reports using `@langchain/community/document_loaders/fs/pdf` and splits them using `RecursiveCharacterTextSplitter`.
- **Zero-API Test Harness**: Equipment for mock configurations (e.g. `FakeEmbeddings` and `FakeListChatModel`), ensuring integration tests run credential-free and dependency-isolated.

## Core API

### `AviationRAG`

#### `buildIndex(docsDir: string, indexOutputDir: string): Promise<void>`
Parses all PDFs in `docsDir`, splits text, generates embeddings, and saves a local HNSW vector database to `indexOutputDir`.

#### `query(queryText: string, indexPath: string): Promise<string>`
Loads the vector database at `indexPath`, retrieves similar documents, feeds them into a context prompt, and generates a grounded response.

## Usage Example

```typescript
import { AviationRAG } from '@ai-enhanced-web-apps/rag';

const rag = new AviationRAG();

// Build index
await rag.buildIndex('./reports-pdf', './storage/index');

// Query index
const answer = await rag.query('What causes icing on Cessna aircraft?', './storage/index');
console.log(answer);
```

## Running Tasks

### Build
```bash
npx nx build @ai-enhanced-web-apps/rag
```

### Test
```bash
npx nx test @ai-enhanced-web-apps/rag
```

# Building AI-Enhanced Web Apps

This repository contains my experiments, projects, and learning notes as I build AI-enhanced full-stack web applications using LLMs and generative AI, inspired by *Building AI-Enhanced Web Apps* by Theo Despoudis.

The central applications in this monorepo are:
*   **Astra Document Summary** (`astra-document-summary`): A Next.js-based conversational AI web assistant designed for document parsing and text summarization. Powered by Google Gemini (via Vertex AI and the Vercel AI SDK), it supports uploading files (PDF, DOCX) or pasting raw text to generate cohesive, structured summaries.
*   **Astra Aviation RAG** (`astra-aviation-rag`): A Next.js-based conversational AI web assistant designed to search and analyze NTSB safety incident reports using Retrieval-Augmented Generation (RAG) and local hierarchical navigable small world (HNSW) vector indexing.

## Core Technology Stack
I will be building applications utilizing modern tooling without needing to dive deep into machine learning theory or Python. The core stack includes:
*   Frontend & Backend: React (for reusable UI components) and Next.js (for full-stack file-based routing and API handlers).
*   AI Integration: The Vercel AI SDK (for connecting the UI to AI providers and handling real-time streaming) and LangChain.js (for building sophisticated workflows, document retrieval, and autonomous agents).
*   LLMs & Data: Utilizing external AI providers like OpenAI and Google Gemini, alongside vector databases and tools like Upstash Redis.

## Major Libraries & Use Cases
Below is a list of the major libraries used in the workspace and their primary use cases:

| Library | Description & Use Case |
| :--- | :--- |
| **`ai` (Vercel AI SDK Core)** | Provides a unified, provider-agnostic interface for executing AI workflows. Used to generate text (`generateText`), stream text (`streamText`), generate embeddings (`embed`, `embedMany`), calculate cosine similarity, and manage tool/function calling in the `astra-document-summary` chat client and standalone CLI projects. |
| **`@ai-sdk/google`** | Integration adapter for Google Gemini models (e.g., `gemini-2.5-flash`, `gemini-1.5-pro`) via the Vercel AI SDK. |
| **`@ai-sdk/google-vertex`** | Direct Vercel AI SDK adapter for Google Cloud Vertex AI services, allowing enterprise deployments authenticated via Application Default Credentials (ADC). |
| **`@ai-sdk/openai`** | Provider adapter for OpenAI models (e.g., `gpt-4o`) within the Vercel AI SDK ecosystem. |
| **`@ai-sdk/react` & `@ai-sdk/rsc`** | Frontend hook packages supporting real-time streaming, chat state management (`useChat`, `useCompletion`), and React Server Components/Server Actions UI streaming integrations in `apps/astra-document-summary`. |
| **`@langchain/core`** | Abstraction layer for LangChain workflows, providing prompts, output parsers, message definitions, and runnables. |
| **`@langchain/google-vertexai`** | Integrates Google Vertex AI chat models (`ChatVertexAI`) and text/document embeddings (`VertexAIEmbeddings`) with LangChain. |
| **`@langchain/textsplitters`** | Semantic and character-based document splitters (like `RecursiveCharacterTextSplitter`) to chunk document text. |
| **`@langchain/classic`** | Contains classic vector storage implementations, specifically `MemoryVectorStore`, for temporary, in-memory document retrieval and similarity search. |
| **`@langchain/langgraph`** | Library for building stateful, multi-actor applications with LLMs, used to orchestrate the ReAct agent runtime in the `astra-document-summary` application. |
| **`langchain`** | Core LangChain package, used for the updated non-deprecated `createAgent` orchestration API in `apps/astra-document-summary`. |
| **`@google/genai`** | Official Google Gen AI Node.js SDK, used directly in standalone projects like `counting-tokens-vertexai` to count text/multimodal tokens and invoke Gemini models outside standard abstractions. |
| **`@dqbd/tiktoken`** | High-performance BPE tokenizer used to accurately calculate token lengths for OpenAI models. |
| **`zod`** | TypeScript-first schema declaration and validation library, used for structured data extraction and tool definition schemas. |
| **`string-comparison`** | String similarity and comparison library used in evaluations (e.g., cosine similarity). |
| `@nestjs/core` & `@nestjs/common` | Framework containers and injection utilities used to structure standalone CLI applications and manage their lifecycles. |
| `@ai-enhanced-web-apps/logger` | A shared, performance-oriented logging library built on top of Pino. It provides colorized console logs via `pino-pretty` in development and integrates with NestJS applications. |
| `next` | React framework for full-stack web applications supporting Server-Side Rendering (SSR), Server Components, and secure API route handlers. |
| `tailwindcss` & `@radix-ui/react-*` | CSS utility styling and accessible, headless Radix UI components used to construct premium, responsive UI components. |

## Key Concepts & Skills Acquired

### 1. Fundamentals of Generative AI in Web Apps
*   Understanding the transition from traditional pattern-recognition AI to generative models driven by Transformers.
*   Architecting the flow of user interactions, from data preprocessing pipelines to routing queries to the appropriate LLM.
*   Migrating basic web applications to Next.js to leverage Server Components, secure API routes, and improve overall UI performance.

### 2. The Vercel AI SDK & State Management
*   Implementing provider abstraction to easily swap out LLM providers (e.g., from Google to OpenAI) without requiring major codebase refactoring.
*   Handling streaming text and rendering streaming React components to dramatically improve perceived performance during long AI response generations.
*   Mastering the separation of UI state (what the user sees) and AI state (the context and history the model needs) to ensure scalable, synchronized state management.
*   Generating structured, type-safe data (like JSON) and enabling tool/function calling directly from the AI model to automate workflows.

### 3. Advanced Prompt Engineering & LangChain.js
*   Applying prompt engineering techniques like few-shot learning and chain-of-thought prompting to optimize model outputs and guide step-by-step reasoning.
*   Generating numerical embeddings representing semantic meaning for similarity searches and content recommendations.
*   Using LangChain.js to chain multiple operations together, giving applications the ability to ingest/chunk documents, manage conversational memory, and utilize autonomous agents that can independently execute tasks like web searches.

### 4. Retrieval-Augmented Generation (RAG)
*   Building systems that convert large documents into high-dimensional vector embeddings, storing them in specialized databases like HNSWLib or Upstash Vector.
*   Providing grounding support by querying vector databases for relevant facts before generating a response, thereby verifying accuracy and drastically reducing AI hallucinations.

### 5. Production Deployment, Security & Testing
*   Testing applications effectively by mocking LLM responses and utilizing semantic similarity scoring.
*   Deploying securely using platforms like Vercel and Netlify.
*   Implementing crucial security guardrails for production, including Clerk for user authentication, Upstash Redis for API rate-limiting, and redacting Personally Identifiable Information (PII) for GDPR and CCPA compliance.

### 6. The Model Context Protocol (MCP)
*   Integrating the Model Context Protocol (MCP), an emerging open standard that creates secure, standardized, and interoperable connections between AI agents and external tools, databases, or APIs.

## Project Structure

### Applications
- [apps/astra-document-summary](apps/astra-document-summary): The core Next.js 15+ conversational AI web assistant, designed for document parsing and summarization. Runs on port 4300. See [apps/astra-document-summary/README.md](./apps/astra-document-summary/README.md) for app-specific details.
- [apps/astra-aviation-rag](apps/astra-aviation-rag): The Next.js 15+ conversational AI assistant utilizing RAG to analyze NTSB incident reports. Runs on port 4400. See [apps/astra-aviation-rag/README.md](./apps/astra-aviation-rag/README.md) for app-specific details.
- [apps/standalone/rag-indexer](apps/standalone/rag-indexer): A NestJS CLI application designed to co-locate and compile PDF incident reports into a serialized HNSW vector database.

### Libraries
- [libs/chat-ui](libs/chat-ui): Shared React components (Radix UI, Tailwind CSS).
- [libs/chat-hooks](libs/chat-hooks): Shared React hooks for chat logic and keyboard shortcuts.
- [libs/shared-types](libs/shared-types): Shared TypeScript interfaces and API contracts.
- [libs/shared-utils](libs/shared-utils): Shared utility functions (e.g., cn).
- [libs/rag](libs/rag): Shared RAG library containing HNSWLib index builder and LCEL query chain using Google Vertex AI.
- [libs/logger](libs/logger): Shared logging library wrapping Pino, with custom pretty printing in development and NestJS integration.

## Logging Architecture

The monorepo uses a unified, structured logging architecture powered by [Pino](https://github.com/pinojs/pino) through the shared `@ai-enhanced-web-apps/logger` library.

### Development vs. Production
* **Development (`NODE_ENV !== 'production'`)**: Logs are formatted and colorized using `pino-pretty` to be highly readable. Standard system timestamps are shown, and internal metadata like process IDs (`pid`) and hostnames are ignored.
* **Production**: Logs are emitted as fast, raw JSON streams, suitable for ingestion by external log aggregators (e.g., Datadog, ELK, GCP Cloud Logging).
* **Configuration**: The log level is configurable using the `LOG_LEVEL` environment variable (defaults to `info`).

### Usage in Next.js
In Next.js applications (such as [astra-aviation-rag](apps/astra-aviation-rag)), you import the `logger` directly and write messages with appropriate log levels (`info`, `error`, `warn`, `debug`, `trace`):
```typescript
import { logger } from '@ai-enhanced-web-apps/logger';

// Info logging
logger.info('[continueConversation] START (Aviation Incident RAG)');

// Error logging (passing the error object for structured logs)
logger.error({ err: error }, '[continueConversation] RAG Error');
```

### Usage in NestJS Standalone Apps
In NestJS applications (such as [rag-indexer](apps/standalone/rag-indexer)), you use the framework's native `@nestjs/common` `Logger` API. During application bootstrapping in `main.ts`, standard logs are intercepted and redirected to Pino using the `NestLoggerService`:

```typescript
// main.ts
import { NestLoggerService } from '@ai-enhanced-web-apps/logger';

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: new NestLoggerService(),
});
```

```typescript
// app.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async runIndexer() {
    this.logger.log('Starting Aviation Incident Report Indexer CLI...');
    this.logger.warn('Source dataset directory not found. Relying on pre-existing assets.');
  }
}
```
This ensures a single logger backend handles and formats logs for all components in the monorepo.

## Screenshots

| ![Screenshot 1](./docs/Screenshot%202026-05-08%20at%2018.11.51%20(2).png) | ![Screenshot 2](./docs/Screenshot%202026-05-08%20at%2018.13.14%20(2).png) | ![Screenshot 3](./docs/Screenshot%202026-05-08%20at%2018.13.45%20(2).png) |
|:---:|:---:|:---:|
| Initial View | Chatting with Astra Document Summary | Full Conversation |

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Google Cloud SDK (for Vertex AI authentication)

### Authentication

Ensure you have Application Default Credentials (ADC) set up:
```bash
gcloud auth application-default login
```

### Installation

```bash
npm install
```

### Running the Application

To run the Document Summary application:
```bash
npm exec nx dev astra-document-summary
```

To run the Aviation RAG application:
```bash
npm exec nx dev astra-aviation-rag
```

## Running Tasks

Nx is used for running all tasks.

### Build

```bash
npx nx build astra-document-summary
```

### Test

To run unit and integration tests across the workspace, you can use the following commands:

* **Run all tests in the workspace**:
  ```bash
  npx nx run-many -t test
  ```

* **Run tests for a specific application**:
  ```bash
  npx nx test astra-document-summary
  ```

* **Run tests for a specific shared library**:
  For example, to run tests for the `@ai-enhanced-web-apps/rag` library:
  ```bash
  npx nx test @ai-enhanced-web-apps/rag
  ```

* **Run tests only on projects affected by recent changes**:
  ```bash
  npx nx affected -t test
  ```


### Linting

```bash
npx nx lint astra-document-summary
```

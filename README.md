# Building AI-Enhanced Web Apps

Welcome! This repository is an Nx-based monorepo containing full-stack applications, CLI indexers, and shared libraries demonstrating how to build modern, AI-enhanced web applications using LLMs and generative AI.

The workspace is inspired by the book *Building AI-Enhanced Web Apps* by Theo Despoudis, focusing on Google Vertex AI, Next.js, and the Vercel AI SDK.

---

## 📱 Central Applications

*   **Astra Document Summary** ([apps/astra-document-summary](apps/astra-document-summary) | [Deploy URL](https://project-kl3jb.vercel.app/)): A Next.js-based conversational AI assistant for document parsing and summarization. Powered by Google Gemini (via Vertex AI), it supports PDF/DOCX file uploads or raw text inputs to generate cohesive summaries.
*   **Astra Aviation RAG** ([apps/astra-aviation-rag](apps/astra-aviation-rag) | [Deploy URL](https://project-zffq7.vercel.app/)): A Next.js-based conversational AI safety assistant. It queries NTSB aviation accident reports using Retrieval-Augmented Generation (RAG) backed by a local Hierarchical Navigable Small World (HNSW) vector index.

---

## 📸 Screenshots

| ![Initial View](./docs/Screenshot%202026-05-08%20at%2018.11.51%20(2).png) | ![Chatting](./docs/Screenshot%202026-05-08%20at%2018.13.14%20(2).png) | ![Full Chat](./docs/Screenshot%202026-05-08%20at%2018.13.45%20(2).png) |
|:---:|:---:|:---:|
| **Initial View** | **Chatting with Astra Document Summary** | **Full Conversation History** |

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org) (v18+)
*   [Google Cloud SDK](https://cloud.google.com/sdk) (for Vertex AI authentication)
*   [Infisical CLI](https://infisical.com/docs/cli/overview) (for secrets management)

### 2. Google Cloud Authentication
Authenticate your local environment to Vertex AI using Application Default Credentials (ADC):
```bash
gcloud auth application-default login
```

### 3. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 4. Infisical Secrets Injection
If you are managing your environment variables and API keys (Vertex AI, Clerk, Upstash Redis) using Infisical, all commands that access external services require secrets injection via the `infisical run --` wrapper.

### 5. Build the Local Vector Index
If you are running the **Astra Aviation RAG** app, build its local database index. Running the indexer requires Vertex AI credentials:
```bash
# Build the indexer CLI
npx nx build rag-indexer

# Run the indexer CLI (injecting secrets)
infisical run -- npx nx execute rag-indexer
```

### 6. Run the Applications
Start the Next.js development servers (secrets must be injected for dynamic routing, rate limiting, and model access):

*   **Run Document Summary** (Default port: `4300`):
    ```bash
    infisical run -- npx nx dev astra-document-summary
    ```
*   **Run Aviation RAG** (Default port: `4400`):
    ```bash
    infisical run -- npx nx dev astra-aviation-rag
    ```

*   **Production Build & Start** (if building static pages that require credentials):
    ```bash
    infisical run -- npx nx build astra-document-summary
    infisical run -- npx nx start astra-document-summary
    ```

---

## 🛠️ Project Structure

### Applications
*   [apps/astra-document-summary](apps/astra-document-summary): Next.js 15+ conversational AI web assistant.
*   [apps/astra-aviation-rag](apps/astra-aviation-rag): Next.js 15+ conversational AI safety assistant.
*   [apps/standalone/rag-indexer](apps/standalone/rag-indexer): NestJS CLI to index source reports to local HNSW vector stores.

### Shared Libraries
*   [libs/chat-ui](libs/chat-ui): Reusable React presentation components (Radix, Tailwind CSS).
*   [libs/chat-hooks](libs/chat-hooks): React hooks for chat logic, submission shortcuts, response streaming and stream decoding (`useDocumentSummary`), and model-to-UI message mappings (`useAviationChat`).
*   [libs/shared-types](libs/shared-types): Shared TypeScript API contracts.
*   [libs/shared-utils](libs/shared-utils): Tailwind merging helpers, static prompts, and AI model configs.
*   [libs/rag](libs/rag): Shared LCEL search chains and vector indexes.
*   [libs/logger](libs/logger): Unified Pino logging wrapper.

---

## 💡 Tech Stack & Major Libraries

| Library | Use Case |
| :--- | :--- |
| **`ai` (Vercel AI SDK Core)** | Unified provider-agnostic interface for text generation, embeddings, and tool calling. |
| **`@ai-sdk/google-vertex`** | Adapter for enterprise Google Cloud Vertex AI services. |
| **`@ai-sdk/openai`** | Adapter for OpenAI models (e.g. `gpt-4o`). |
| **`@ai-sdk/react` & `@ai-sdk/rsc`** | Frontend streaming hooks (`useChat`, `useCompletion`) and server action wrappers. |
| **`@clerk/nextjs`** | User authentication, session management, and page/route protection. |
| **`@langchain/core`** | Abstraction layer for LangChain LCEL sequences and output parsers. |
| **`@langchain/google-vertexai`** | Integration for Vertex AI models and vector embeddings in LangChain workflows. |
| **`hnswlib-node`** | C++ binder for extremely fast local Hierarchical Navigable Small World vector search. |
| **`pino` & `pino-pretty`** | Core high-performance logging suite. |
| **`@upstash/redis` & `@upstash/ratelimit`** | HTTP REST Redis client and sliding-window rate limiter for serverless Edge runtimes. |

---

## 🛡️ Edge Request Proxies & Authentication (Next.js 16+)

Both web applications implement Next.js 16+ compliant **`proxy.ts`** Edge middleware files. They intercept incoming requests and execute a composed chain of:
1. **User Authentication (Clerk.js)**: Verifies user session and protects internal routes (like `/`), automatically redirecting unauthenticated users to `/sign-in`.
2. **CORS Handling**: Cross-Origin resource settings for pre-flight requests on API paths.
3. **IP-based Rate Limiting**: Sliding-window rate limit checks (5 requests per 10 seconds) powered by Upstash Redis on API paths.
4. **User-based Message Quotas**: Enforces daily message quota limits (10 queries per day per authenticated user) powered by Upstash Redis on API paths.
5. **Security Headers**: Standard response header protection (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, etc.).

The proxy logic is encapsulated inside the shared workspace utility and exposed via the sub-path export `@ai-enhanced-web-apps/shared-utils/middleware` to keep Edge-only dependencies isolated, while Clerk-specific route checks run at the application level in `proxy.ts`.

---

## 🪵 Unified Logging System

We route all workspace logs through a unified logging pipeline powered by [Pino](https://github.com/pinojs/pino):

*   **Development Mode**: Output is colorized and pretty-printed using `pino-pretty` to be highly readable.
*   **Production Mode**: Emitted as raw JSON lines optimized for ingestion by cloud log routing agents.

### Example Logging in Code
```typescript
import { logger } from '@ai-enhanced-web-apps/logger';

// Standard structured log
logger.info({ route: '/api/chat' }, 'Processing query...');

// Logging errors with structured context
logger.error({ err: error }, 'RAG pipeline execution failed');
```

---

## 🧠 Key Concepts & Takeaways

1.  **Generative AI Web Architecture**: Transitioning from model-agnostic prompt setups to robust full-stack layouts separating UI and AI state cleanly.
2.  **RAG Pipelines**: Semantic chunking of PDF documents, compiling databases using local HNSWLib indexes, and injecting factual search results into prompts to ground generated responses.
3.  **Autonomous Tool Loop**: Triggering client-side UI updates (like live weather widgets) and database lookups dynamically through LLM tool/function calling schemas.
4.  **Production Hardening**: Securing APIs using rate limiters (Upstash Redis), mocking provider calls during test execution, and keeping tests isolated from external networks.

---

## 🏃 Running Developer Tasks

Nx commands can be prefixed with `npx` or the workspace package manager:

*   **Build a Project**:
    ```bash
    npx nx build astra-document-summary
    ```
*   **Run Unit & Integration Tests**:
    ```bash
    npx nx run-many -t test
    ```
*   **Lint All Code**:
    ```bash
    npx nx run-many -t lint
    ```

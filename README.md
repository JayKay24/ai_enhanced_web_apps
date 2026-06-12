# Building AI-Enhanced Web Apps

<p align="center">
  <img src="https://img.shields.io/badge/Nx-143055?style=for-the-badge&logo=nx&logoColor=white" alt="Nx" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vertex_AI-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Vertex AI" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
  <img src="https://img.shields.io/badge/Upstash-00E19B?style=for-the-badge&logo=upstash&logoColor=white" alt="Upstash" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

Welcome! This repository is an Nx-based monorepo containing full-stack applications, CLI indexers, and shared libraries demonstrating how to build modern, AI-enhanced web applications using LLMs and generative AI.

The workspace is inspired by the book *Building AI-Enhanced Web Apps* by Theo Despoudis, focusing on Google Vertex AI, Next.js, and the Vercel AI SDK.

---

## 📱 Central Applications

| Application | Source Code | Deploy URL | Description |
| :--- | :--- | :--- | :--- |
| **Astra Document Summary** | [`apps/astra-document-summary`](apps/astra-document-summary) | [🚀 Live Demo](https://project-kl3jb.vercel.app/) | Next.js-based conversational AI assistant for document parsing and summarization. Supports PDF/DOCX file uploads or raw text inputs. |
| **Astra Aviation RAG** | [`apps/astra-aviation-rag`](apps/astra-aviation-rag) | [🚀 Live Demo](https://project-zffq7.vercel.app/) | Next.js-based conversational AI safety assistant. Queries NTSB aviation accident reports using RAG backed by a local HNSW vector index. |
| **Astra Interview Assistant** | [`apps/astra-interview-assistant`](apps/astra-interview-assistant) | [🚀 Live Demo](https://project-n9t17.vercel.app/) | Next.js-based conversational AI assistant simulating real-world job interviews with personalized feedback. |

> [!NOTE]
> **Experimental MCP Server:** The Interview Assistant integrates with an experimental standalone NestJS server ([`apps/astra-mcp-server`](apps/astra-mcp-server/README.md)) via the Model Context Protocol (MCP). It uses the `StreamableHTTPTransport` to dynamically fetch mock frontend technical questions based on the user's selected difficulty level.

> [!IMPORTANT]
> **Authentication & Session Isolation:** For the optimal experience, log in to **one** application at a time. To switch between applications, log out of the current one first. This is because a custom shared domain has not been set up across the three deployments, and Clerk.js satellite domain configurations (to share sessions across distinct domains) are a paid Clerk Pro feature.


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
*   **Run Interview Assistant** (Default port: `4500`):
    ```bash
    infisical run -- npx nx dev astra-interview-assistant
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
*   [apps/astra-interview-assistant](apps/astra-interview-assistant): Next.js 15+ conversational AI job interview practice assistant.
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

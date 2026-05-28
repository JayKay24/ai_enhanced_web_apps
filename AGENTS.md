# Project Context: Astra Monorepo (Document Summary & Aviation RAG)

This project is an Nx-based monorepo for building AI-enhanced web applications. The core applications are:
- **Astra Document Summary** (`astra-document-summary`): A Next.js-based conversational AI web assistant designed for document parsing and summarization. It is integrated with Google Gemini via Vertex AI and the Vercel AI SDK, supporting real-time streaming, text/document uploads (.pdf, .docx), and text summarization.
- **Astra Aviation RAG** (`astra-aviation-rag`): A Next.js-based conversational AI web assistant designed to search and analyze NTSB safety incident reports using Retrieval-Augmented Generation (RAG) and local hierarchical navigable small world (HNSW) vector indexing.

## Project Overview

- **Monorepo Tool:** [Nx](https://nx.dev)
- **Frontend/Backend Framework:** Next.js 15+ (App Router)
- **AI Integration:** Vercel AI SDK (`ai` and `@ai-sdk/google`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com), Radix UI, Lucide Icons
- **Port Mapping:**
  - `astra-document-summary`: 4300 (Next.js)
  - `astra-aviation-rag`: 4400 (Next.js)

### Key Libraries & Tech Stack

This project leverages the following core libraries for various AI-enhanced and full-stack functionalities:

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

## Directory Structure

### Applications

- `apps/astra-document-summary/`: Next.js 15+ conversational AI web assistant featuring streaming, file upload support, and document summarization.
- `apps/astra-aviation-rag/`: Next.js 15+ conversational AI safety assistant utilizing local HNSWLib RAG and Gemini via Vertex AI.
- `apps/standalone/`: CLI-based NestJS applications demonstrating specific workflows (e.g., `document-retrieval-flow`, `few-shot-chain`, `rag-indexer`).

### Shared Libraries

- `libs/chat-ui/`: Shared React UI components (Radix, Tailwind).
- `libs/chat-hooks/`: Shared React hooks for chat functionality.
- `libs/shared-types/`: Shared TypeScript interfaces.
- `libs/shared-utils/`: Shared utilities and AI provider configurations.
- `libs/rag/`: Shared RAG library containing index builder and LCEL query chain using Google Vertex AI.
- `libs/logger/`: Shared logging library wrapping Pino, with custom pretty printing in development and NestJS integration.

## Application Architecture

### AI Integration

- **Astra Document Summary Client (`apps/astra-document-summary`):** Uses the Vercel AI SDK for streaming chat responses.
  - API Route: `apps/astra-document-summary/src/app/(chat)/api/chat/route.ts`
  - Uses `streamText` for real-time interaction.
  - Requires Vertex AI Application Default Credentials (ADC).
- **Architectural Pattern for AI SDKs:**
  - **Shared Config:** Store non-sensitive metadata (model names, provider IDs) in `libs/shared-utils/src/lib/ai-model-config.ts`.
  - **Server-Only Logic:** Store model factory logic in `libs/shared-utils/src/lib/ai-providers.ts`.
  - **Bundling Protection:** Use sub-path exports (e.g., `@ai-enhanced-web-apps/shared-utils/ai-providers`) for server-side code to avoid browser bundling errors.

- **Vertex AI vs Google Gen AI SDK Guidelines:**
  - **Preferred Provider**: Always prefer building features using **Vertex AI** (e.g., `@ai-sdk/google-vertex` or `@langchain/google-vertexai`) over the standalone `@google/genai` (Google Gen AI SDK).
  - **Authentication**: Reuse the active Google Cloud session authenticated via Application Default Credentials (ADC) by running `gcloud auth application-default login`.
  - **Environment Variables**: Ensure Vertex AI is configured with the following active environment variables:
    - `VERTEX_AI_PROJECT_ID`: The Google Cloud Project ID.
    - `VERTEX_AI_LOCATION`: The Google Cloud Region/Location (e.g., `us-central1`).

### Standalone CLI Applications

- **CLI Bootstrapping Pattern:** Standalone CLI applications (found in `apps/standalone/`) should not run a persistent HTTP server. Instead:
  - Boot using `NestFactory.createApplicationContext` as configured in [main.ts](./apps/standalone/document-retrieval-flow/src/main.ts).
  - Execute their main services within a `try-catch-finally` block.
  - Call `await app.close()` and immediately exit the process (e.g., `process.exit(0)` for success, `process.exit(1)` on failure).
- **Execution Target:** Standalone apps must define an `execute` target in their `package.json` with `"watch": false` to run the script once to completion, for example:
  ```json
  "execute": {
    "executor": "@nx/js:node",
    "defaultConfiguration": "development",
    "dependsOn": ["build"],
    "options": {
      "buildTarget": "project-name:build",
      "watch": false
    }
  }
  ```

### Logging Architecture

The monorepo features a unified logging mechanism defined in `libs/logger` (`@ai-enhanced-web-apps/logger`) utilizing the **Pino** structured logging library.

- **Development Mode (`NODE_ENV !== 'production'`)**: Formats output nicely using `pino-pretty` with standard timestamps and stripped pid/hostname flags.
- **Production Mode**: Emits raw JSON lines for high performance and easy ingestion by cloud log routing agents.
- **Level Selection**: Defaults to `info` and can be overridden via `LOG_LEVEL` environment variable.

#### Usage in Next.js
Directly import the raw `logger` from the shared library:
```typescript
import { logger } from '@ai-enhanced-web-apps/logger';

logger.info('[continueConversation] START (Aviation Incident RAG)');
logger.error({ err: error }, '[continueConversation] RAG Error');
```

#### Usage in NestJS CLI Applications
NestJS applications log using the standard `@nestjs/common` `Logger` class (e.g. `private readonly logger = new Logger(AppService.name)`). To capture and format these log calls through the same Pino instance, applications must configure `NestLoggerService` during bootstrap:
```typescript
// main.ts
import { NestLoggerService } from '@ai-enhanced-web-apps/logger';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new NestLoggerService(),
  });
  // ...
}
```

## Building and Running

Commands are typically executed via Nx.

### Development

```sh
npm exec nx dev astra-document-summary
```

```sh
npm exec nx dev astra-aviation-rag
```

### Build

```sh
npm exec nx build astra-document-summary
```

```sh
npm exec nx build astra-aviation-rag
```

## Development Conventions

- **Module Boundaries:** Strictly enforced via `@nx/enforce-module-boundaries`.
- **TypeScript:** Strict mode enabled.
- **Styling:** Tailwind utility classes are preferred.
- **TSDoc/JSDoc Documentation:** Always write or update JSDoc/TSDoc annotations (`/** ... */`) for all exported functions, classes, interfaces, and public entrypoints. Focus on explaining the parameter intent, behavior, expected exceptions, and providing usage examples instead of duplicating types. This ensures clear IDE Intellisense and successful compiling of the TypeDoc HTML workspace documentation portal.

### Shared Library Imports

#### Chat UI Components

Import from `@ai-enhanced-web-apps/chat-ui`:

```typescript
import { AutoScroll, ChatList, Button } from '@ai-enhanced-web-apps/chat-ui';
```

#### Shared Types

Import from `@ai-enhanced-web-apps/shared-types`:

```typescript
import { Message, ChatResponse } from '@ai-enhanced-web-apps/shared-types';
```

## MCP

This project utilizes Model Context Protocol (MCP) to enhance development workflows.

- **Context7** - Always use Context7 MCP (`https://mcp.context7.com/mcp`) when writing or explaining code that involves external libraries or frameworks.
- **Nx MCP** - Always use for understanding workspace architecture, project dependencies, and configuration (`npx nx mcp`).
- **Next DevTools** - Always use for Next.js-specific development tools, diagnostics, and upgrades (`npx next-devtools-mcp@latest`).
- **GitHub MCP** - Always Use for GitHub repository queries e.g. reading code files from the given GitHub link.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

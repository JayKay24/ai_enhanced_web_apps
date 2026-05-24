# Building AI-Enhanced Web Apps

This repository contains my experiments, projects, and learning notes as I build AI-enhanced full-stack web applications using LLMs and generative AI, inspired by *Building AI-Enhanced Web Apps* by Theo Despoudis.

The central application in this monorepo is **Astra**, a Next.js-based conversational web assistant integrated with Google Gemini via Vertex AI and the Vercel AI SDK. It supports real-time chat streaming, multimodal image input, and document upload & summarization (.pdf, .docx).

## Core Technology Stack
I will be building applications utilizing modern tooling without needing to dive deep into machine learning theory or Python. The core stack includes:
*   Frontend & Backend: React (for reusable UI components) and Next.js (for full-stack file-based routing and API handlers).
*   AI Integration: The Vercel AI SDK (for connecting the UI to AI providers and handling real-time streaming) and LangChain.js (for building sophisticated workflows, document retrieval, and autonomous agents).
*   LLMs & Data: Utilizing external AI providers like OpenAI and Google Gemini, alongside vector databases and tools like Upstash Redis.

## Major Libraries & Use Cases
Below is a list of the major libraries used in the workspace and their primary use cases:

| Library | Description & Use Case |
| :--- | :--- |
| **`ai` (Vercel AI SDK Core)** | Provides a unified, provider-agnostic interface for executing AI workflows. Used to generate text (`generateText`), stream text (`streamText`), generate embeddings (`embed`, `embedMany`), calculate cosine similarity, and manage tool/function calling in the `astra` chat client and standalone CLI projects. |
| **`@ai-sdk/google`** | Integration adapter for Google Gemini models (e.g., `gemini-2.5-flash`, `gemini-1.5-pro`) via the Vercel AI SDK. |
| **`@ai-sdk/google-vertex`** | Direct Vercel AI SDK adapter for Google Cloud Vertex AI services, allowing enterprise deployments authenticated via Application Default Credentials (ADC). |
| **`@ai-sdk/openai`** | Provider adapter for OpenAI models (e.g., `gpt-4o`) within the Vercel AI SDK ecosystem. |
| **`@ai-sdk/react` & `@ai-sdk/rsc`** | Frontend hook packages supporting real-time streaming, chat state management (`useChat`, `useCompletion`), and React Server Components/Server Actions UI streaming integrations in `apps/astra`. |
| **`@langchain/core`** | Abstraction layer for LangChain workflows, providing prompts, output parsers, message definitions, and runnables. |
| **`@langchain/google-vertexai`** | Integrates Google Vertex AI chat models (`ChatVertexAI`) and text/document embeddings (`VertexAIEmbeddings`) with LangChain. |
| **`@langchain/textsplitters`** | Semantic and character-based document splitters (like `RecursiveCharacterTextSplitter`) to chunk document text. |
| **`@langchain/classic`** | Contains classic vector storage implementations, specifically `MemoryVectorStore`, for temporary, in-memory document retrieval and similarity search. |
| **`@langchain/langgraph`** | Library for building stateful, multi-actor applications with LLMs, used to orchestrate the ReAct agent runtime in the `astra` application. |
| **`langchain`** | Core LangChain package, used for the updated non-deprecated `createAgent` orchestration API in `apps/astra`. |
| **`@google/genai`** | Official Google Gen AI Node.js SDK, used directly in standalone projects like `counting-tokens-vertexai` to count text/multimodal tokens and invoke Gemini models outside standard abstractions. |
| **`@dqbd/tiktoken`** | High-performance BPE tokenizer used to accurately calculate token lengths for OpenAI models. |
| **`zod`** | TypeScript-first schema declaration and validation library, used for structured data extraction and tool definition schemas. |
| **`string-comparison`** | String similarity and comparison library used in evaluations (e.g., cosine similarity). |
| **`@nestjs/core` & `@nestjs/common`** | Framework containers and injection utilities used to structure standalone CLI applications and manage their lifecycles. |
| **`next`** | React framework for full-stack web applications supporting Server-Side Rendering (SSR), Server Components, and secure API route handlers. |
| **`tailwindcss` & `@radix-ui/react-*`** | CSS utility styling and accessible, headless Radix UI components used to construct premium, responsive UI components. |

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
- apps/astra: A Next.js 15+ implementation with a built-in API route (/api/chat). Runs on port 4300. See [apps/astra/README.md](./apps/astra/README.md) for app-specific details.

### Libraries
- libs/chat-ui: Shared React components (Radix UI, Tailwind CSS).
- libs/chat-hooks: Shared React hooks for chat logic and keyboard shortcuts.
- libs/shared-types: Shared TypeScript interfaces and API contracts.
- libs/shared-utils: Shared utility functions (e.g., cn).

## Screenshots

| ![Screenshot 1](./docs/Screenshot%202026-05-08%20at%2018.11.51%20(2).png) | ![Screenshot 2](./docs/Screenshot%202026-05-08%20at%2018.13.14%20(2).png) | ![Screenshot 3](./docs/Screenshot%202026-05-08%20at%2018.13.45%20(2).png) |
|:---:|:---:|:---:|
| Initial View | Chatting with Astra | Full Conversation |

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

```bash
npx nx serve astra
```

## Running Tasks

Nx is used for running all tasks.

### Build

```bash
npx nx build astra
```

### Test

```bash
npx nx test astra
```

### Linting

```bash
npx nx lint astra
```

## Documentation

For more detailed information on development workflows and guidelines, see [GEMINI.md](./GEMINI.md).

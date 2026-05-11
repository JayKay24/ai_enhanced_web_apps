# Learning Journey: Building AI-Enhanced Web Apps

This repository tracks my progress through the concepts and projects found in the book *Build AI-Enhanced Web Apps* by Theo Despoudis. The primary goal of this learning path is to empower web developers to build dynamic, intelligent full-stack applications that leverage Large Language Models (LLMs) and generative AI within the familiar JavaScript ecosystem.

## Core Technology Stack
I will be building applications utilizing modern tooling without needing to dive deep into machine learning theory or Python. The core stack includes:
*   **Frontend & Backend:** React (for reusable UI components) and Next.js (for full-stack file-based routing and API handlers).
*   **AI Integration:** The **Vercel AI SDK** (for connecting the UI to AI providers and handling real-time streaming) and **LangChain.js** (for building sophisticated workflows, document retrieval, and autonomous agents).
*   **LLMs & Data:** Utilizing external AI providers like **OpenAI and Google Gemini**, alongside vector databases and tools like Upstash Redis.

## Key Concepts & Skills Acquired

### 1. Fundamentals of Generative AI in Web Apps
*   Understanding the transition from traditional pattern-recognition AI to generative models driven by Transformers.
*   Architecting the flow of user interactions, from data preprocessing pipelines to routing queries to the appropriate LLM.
*   Migrating basic web applications to Next.js to **leverage Server Components, secure API routes, and improve overall UI performance**.

### 2. The Vercel AI SDK & State Management
*   Implementing **provider abstraction** to easily swap out LLM providers (e.g., from Google to OpenAI) without requiring major codebase refactoring.
*   **Handling streaming text and rendering streaming React components** to dramatically improve perceived performance during long AI response generations.
*   Mastering the **separation of UI state (what the user sees) and AI state (the context and history the model needs)** to ensure scalable, synchronized state management.
*   Generating **structured, type-safe data (like JSON)** and enabling **tool/function calling** directly from the AI model to automate workflows.

### 3. Advanced Prompt Engineering & LangChain.js
*   Applying prompt engineering techniques like **few-shot learning and chain-of-thought prompting** to optimize model outputs and guide step-by-step reasoning.
*   Generating numerical **embeddings** representing semantic meaning for similarity searches and content recommendations.
*   Using LangChain.js to chain multiple operations together, giving applications the ability to ingest/chunk documents, manage conversational memory, and utilize **autonomous agents** that can independently execute tasks like web searches.

### 4. Retrieval-Augmented Generation (RAG)
*   Building systems that convert large documents into high-dimensional vector embeddings, storing them in specialized databases like HNSWLib or Upstash Vector.
*   Providing **grounding support** by querying vector databases for relevant facts before generating a response, thereby verifying accuracy and drastically **reducing AI hallucinations**.

### 5. Production Deployment, Security & Testing
*   Testing applications effectively by **mocking LLM responses** and utilizing semantic similarity scoring.
*   Deploying securely using platforms like Vercel and Netlify.
*   Implementing crucial security guardrails for production, including **Clerk for user authentication, Upstash Redis for API rate-limiting, and redacting Personally Identifiable Information (PII)** for GDPR and CCPA compliance.

### 6. The Model Context Protocol (MCP)
*   Integrating the **Model Context Protocol (MCP)**, an emerging open standard that creates secure, standardized, and interoperable connections between AI agents and external tools, databases, or APIs.

## Hands-On Projects
By the end of this journey, I will have built two complete, portfolio-ready applications:
1.  **AI Interview Assistant:** A personalized mock interview tool featuring dynamic conversation memory, Google Cloud text-to-speech integration, and automated performance feedback.
2.  **Corporate RAG Agent:** A full-stack knowledge base application where users can authenticate, upload PDFs and DOCX files, manage vectorized documents, and converse with an AI securely grounded in the uploaded proprietary data.

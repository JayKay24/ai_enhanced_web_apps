# Agent Context: Astra Monorepo (AI Web Apps)

This document contains architectural rules, module boundaries, compilation constraints, and runtime patterns for AI agents working in this monorepo.

---

## 1. Monorepo Overview & Ports
*   **Workspace Tool**: [Nx](https://nx.dev)
*   **Target Framework**: Next.js 15+ (App Router)
*   **AI Integration**: Vercel AI SDK (`ai` & `@ai-sdk/google*`) and LangChain.js
*   **Styling**: Tailwind CSS & Radix UI
*   **Package Resolution**: ES Modules (ESM) with `"moduleResolution": "nodenext"`
*   **Port Mapping**:
    *   `astra-document-summary`: `4300` (Next.js client)
    *   `astra-aviation-rag`: `4400` (Next.js client)

### Key Projects
*   [apps/astra-document-summary](./apps/astra-document-summary): Next.js conversational summarizer.
*   [apps/astra-aviation-rag](./apps/astra-aviation-rag): Next.js aviation safety query client with RAG.
*   [apps/standalone/rag-indexer](./apps/standalone/rag-indexer): NestJS CLI to index source reports to local HNSW vector stores.
*   [libs/chat-ui](./libs/chat-ui): Reusable React presentation components.
*   [libs/chat-hooks](./libs/chat-hooks): React UX and input submission hooks.
*   [libs/shared-types](./libs/shared-types): Shared TypeScript API contracts.
*   [libs/shared-utils](./libs/shared-utils): General utilities, error trackers, and model metadata.
*   [libs/rag](./libs/rag): Shared LCEL search chains and vector indexes.
*   [libs/logger](./libs/logger): Unified Pino logging wrapper.

---

## 2. Core AI Rules

### Preferred Provider: Vertex AI
*   **Rule**: Always build AI features using Google **Vertex AI** integrations (e.g. `@ai-sdk/google-vertex` or `@langchain/google-vertexai`) instead of the standalone `@google/genai` SDK.
*   **Authentication & Secrets Management**:
    *   **GCP Auth**: Authenticate using Application Default Credentials (ADC):
        ```bash
        gcloud auth application-default login
        ```
    *   **Infisical Integration**: Environment variables/secrets are managed and injected dynamically using the Infisical CLI. Prepend all execution commands with `infisical run --` for `dev`, `start`, and `execute` targets.
*   **Active Env Vars**:
    *   `GCP_PROJECT_ID` / `VERTEX_AI_PROJECT_ID` (GCP Project ID)
    *   `VERTEX_AI_LOCATION` (GCP Location, e.g. `us-central1`)
    *   `GCP_PROJECT_NUMBER` (GCP Project Number, for OIDC Token Exchange)
    *   `GCP_SERVICE_ACCOUNT_EMAIL` (Target GCP Service Account to impersonate)
    *   `GCP_WORKLOAD_IDENTITY_POOL_ID` (GCP Workload Identity Pool ID)
    *   `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID` (GCP Workload Identity Provider ID)
    *   `VERCEL_OIDC_TOKEN` (Vercel-injected OIDC token for Workload Identity Federation in production)
    *   Clerk.js variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, etc.)
    *   Upstash Redis variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)

### Architecture Boundaries & Bundling Protection
*   **Config Separation**: Store non-sensitive provider metadata/names in [ai-model-config.ts](./libs/shared-utils/src/lib/ai-model-config.ts).
*   **Server-Only Files**: Store model factory initialization logic inside [ai-providers.ts](./libs/shared-utils/src/lib/ai-providers.ts).
*   **Bundling Rule**: Use sub-path exports (e.g. `@ai-enhanced-web-apps/shared-utils/ai-providers`) to prevent importing server-side dependencies in browser-compiled components.
*   **Edge Proxy Modules**: Keep Edge/server-only dependencies (like `next/server` and `@upstash/redis`) out of primary exports in shared libraries. Use sub-path exports (e.g. `@ai-enhanced-web-apps/shared-utils/middleware`) to prevent test suite failures (`ReferenceError: Request is not defined`) in client-side modules.

### API Routes & Streaming
*   **Aviation RAG**: Employs `/api/chat` using `createTextStreamResponse` to stream token chunks from `AviationRAG.queryStream`.
*   **Document Summarization**: Employs `/api/summarize` to process text/file summarizations and streams the final reduce phase.
*   **Server Actions**: Legacy Server Actions (`actions.tsx`) and RSC-based context wrappers (`<AI>`) are deprecated and must not be used in the conversational apps.
*   **Edge Requests Proxy (Next.js 16+)**: Under Next.js 16+, middleware files are renamed to `proxy.ts` (placed at the project root) and must export a `proxy` function. Use the pre-built `apiProxyChain` from `@ai-enhanced-web-apps/shared-utils/middleware` to handle rate limiting, user quotas, CORS configuration, and security headers.
*   **Authentication & Clerk.js**: Enforce user authentication using Clerk.js (`@clerk/nextjs`).
    *   **Root Layouts**: Wrap all root layout trees in `<ClerkProvider afterSignOutUrl="/sign-in">`.
    *   **Edge Requests Proxy**: Wrap edge routing in `clerkMiddleware` to protect UI pages (like `/`). For API routes, retrieve Clerk `userId`, inject it into the request headers as `x-user-id`, and chain `apiProxyChain` (which validates daily user message quotas).
    *   **API Routes**: Always enforce authentication checks in API endpoints (e.g. `/api/chat`, `/api/summarize`) using the `auth()` helper, returning `401 Unauthorized` for anonymous requests.
    *   **Shared Components**: Access authentication state in shared UI components (like [Navbar.tsx](file:///Users/jamesnjuguna/Downloads/books/personal_projects/ai_enhanced_web_apps/libs/chat-ui/src/lib/Navbar.tsx)) using Clerk's `<Show when="signed-in">` wrapper and `<UserButton />`.

### Client-Side State & Hook Patterns
*   **Separation of Concerns**: Keep page files view-only. Form handling and UI layouts belong in the page component, while state tracking, streaming decoder loops, and Vercel AI SDK operations belong in custom hooks within the `@ai-enhanced-web-apps/chat-hooks` library (e.g., `useAviationChat`, `useDocumentSummary`).
*   **Encapsulated API Clients**: Always extract API client calls (like `/api/summarize`) into the centralized client layer: `@ai-enhanced-web-apps/shared-utils/src/lib/api.ts` (e.g. `fetchSummaryResponse`).
*   **Static Typing**: Statically type chat message arrays using the `Message` interface from `@ai-enhanced-web-apps/shared-types`.
*   **Loop Closures**: Avoid declaring state-updating function closures within stream loops. Declare updater helper functions outside the loops to prevent mutable loop variable leaks.

---

## 3. CLI Applications (NestJS)
*   **Pattern**: Standalone CLIs (under [apps/standalone/](./apps/standalone/)) must execute once and exit without running persistent HTTP servers.
*   **Bootstrap Pattern**:
    ```typescript
    async function bootstrap() {
      const app = await NestFactory.createApplicationContext(AppModule, {
        logger: new NestLoggerService(),
      });
      try {
        const service = app.get(AppService);
        await service.execute();
        await app.close();
        process.exit(0);
      } catch (err) {
        console.error(err);
        await app.close();
        process.exit(1);
      }
    }
    ```
*   **Nx Config**: Project `package.json` must define `"watch": false` in target options:
    ```json
    "execute": {
      "executor": "@nx/js:node",
      "options": {
        "buildTarget": "project-name:build",
        "watch": false
      }
    }
    ```

---

## 4. Logging Guidelines
We use Pino via the `@ai-enhanced-web-apps/logger` package.
*   **Next.js & standard TS files**: Import the raw `logger` directly:
    ```typescript
    import { logger } from '@ai-enhanced-web-apps/logger';
    logger.info('Processing query...');
    ```
*   **NestJS Apps**: Redirect framework logging through the unified Pino stream by passing `NestLoggerService` to the application context:
    ```typescript
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: new NestLoggerService(),
    });
    ```

---

## 5. Testing & ESM Conventions

### Zero-API Testing Guarantee
*   **No Live Calls**: Unit/integration tests must never call live API endpoints or connect to cloud databases.
*   **LangChain Fakes**: Use `FakeEmbeddings` and `FakeListChatModel` for testing query execution paths.
*   **Mocks**: Mock disk accesses (`fs`) and heavy loaders (`HNSWLib`, `PDFLoader`) using Jest (`jest.mock(...)`).

### Web Stream Polyfills
*   Jest Node environments require global polyfills for streams. Ensure [jest.setup.ts](./libs/rag/jest.setup.ts) includes:
    ```typescript
    import { TextEncoder, TextDecoder } from 'util';
    import { ReadableStream, TransformStream } from 'stream/web';
    Object.assign(global, { TextEncoder, TextDecoder, ReadableStream, TransformStream });
    ```

### Spec Configuration & ESM Imports
*   Match target build compilation rules (`tsconfig.spec.json` aligns with `tsconfig.lib.json`).
*   **Rule**: Under ESM/NodeNext, test spec relative imports **must** include the `.js` extension (e.g. `import { AviationRAG } from './rag.js'`).

---

## 6. Code & Documentation Guidelines
*   **Module Boundaries**: Strictly enforce `@nx/enforce-module-boundaries` rules. Do not bypass via relative path hacks.
*   **JSDoc/TSDoc**: Write/update detailed annotations (`/** ... */`) for all exported functions, classes, and types, focusing on parameters, behavior, exceptions, and usage examples.
*   **Documentation Maintenance**: Always keep the global [README.md](./README.md), individual library/app readmes, and this [AGENTS.md](./AGENTS.md) file up to date whenever new files, configurations, parameters, or architectural patterns are introduced or modified.

---

## 7. Workspace Tooling Rules
*   **Nx Tasks**: Run tasks using Nx with package manager execution (e.g. `npx nx test <project>`). Avoid executing underlying tools directly.
*   **Generators**: Eagerly run scaffolding generators first (via `nx-generate` skill) before configuring files manually.
*   **MCP Tools**: Use **Context7** for external library questions, **Nx MCP** for workspace analysis, and **Next DevTools** for Next.js diagnostics.

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

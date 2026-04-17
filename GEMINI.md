# Project Context: AI Enhanced Web Apps

This project is an Nx-based monorepo designed for building AI-enhanced web applications. It features multiple chat clients (React, Next.js) integrated with Google Gemini 2.5 Flash via Vertex AI, utilizing a shared library architecture.

## Project Overview

- **Monorepo Tool:** [Nx](https://nx.dev)
- **Frontend Frameworks:** React 19 (Astra AI), Next.js 15+ (App Router)
- **Backend Framework:** NestJS (AI Gateway)
- **AI Integration:** Google Gen AI SDK (`@google/genai`) - Gemini 2.5 Flash via Vertex AI
- **Styling:** [Tailwind CSS](https://tailwindcss.com), Radix UI, Lucide Icons
- **Testing:**
  - Frontend Unit/Component: [Vitest](https://vitest.dev)
  - Backend Unit/Integration: [Jest](https://jestjs.io)
  - End-to-End: [Playwright](https://playwright.dev)
- **Port Mapping:**
  - `chat-server`: 3000
  - `chat-client-react`: 4200 (Vite)
  - `chat-client-next`: 4300 (Next.js)

## Directory Structure

### Applications
- `apps/chat-client-react/`: React 19 application (Astra AI) built with Vite.
- `apps/chat-client-next/`: Next.js 15+ implementation with integrated `/api/chat` route.
- `apps/chat-server/`: NestJS backend integrating with Gemini AI.
- `apps/chat-client-react-e2e/`: E2E tests for the React application.
- `apps/chat-server-e2e/`: E2E tests for the backend application.

### Shared Libraries
- `libs/chat-ui/`: Shared React UI components (Radix, Tailwind).
- `libs/chat-hooks/`: Shared React hooks (`useChatFormSubmit`, `useEnterSubmit`, `useFocusOnSlashPress`).
- `libs/shared-types/`: Shared TypeScript interfaces (`Message`, `ChatResponse`).
- `libs/shared-utils/`: Shared utilities (`cn`, `generateUniqueId`, `fetchAssistantResponse`).

## Application Architecture

### AI Integration
- Uses `@google/genai` with `vertexai: true`.
- Requires Application Default Credentials (ADC) for local development (`gcloud auth application-default login`).
- Backend responses strictly follow the `ChatResponse` contract from `shared-types`.

### Client Parity
- Both clients use shared components from `@ai-enhanced-web-apps/chat-ui`.
- Shared components MUST include the `"use client"` directive to support the Next.js App Router.
- Tailwind configurations are synchronized to maintain visual consistency.

## Building and Running

Commands are typically executed via Nx.

### Development

```sh
# Run React client
npx nx serve chat-client-react

# Run Next.js client
npx nx serve chat-client-next

# Run backend
npx nx serve chat-server
```

### Build

```sh
npx nx run-many -t build
```

### Testing

```sh
# Run all tests
npx nx run-many -t test

# Run specific project tests
npx nx test chat-client-react
npx nx test chat-server
```

## Development Conventions

- **Module Boundaries:** strictly enforced via `@nx/enforce-module-boundaries`. Prefer shared types and utils over local duplicates.
- **TypeScript:** Strict mode enabled in `tsconfig.base.json`.
- **Styling:** Tailwind utility classes are preferred. Shared styles are managed via the `chat-ui` library.
- **Testing:** New features MUST include corresponding unit or E2E tests.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globals
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

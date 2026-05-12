# Project Context: Astra AI

This project is an Nx-based monorepo for building AI-enhanced web applications. The core application, **Astra**, is a Next.js-based chat interface integrated with Google Gemini via Vertex AI and the Vercel AI SDK.

## Project Overview

- **Monorepo Tool:** [Nx](https://nx.dev)
- **Frontend/Backend Framework:** Next.js 15+ (App Router)
- **AI Integration:** Vercel AI SDK (`ai` and `@ai-sdk/google`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com), Radix UI, Lucide Icons
- **Port Mapping:**
  - `astra`: 4300 (Next.js)

## Directory Structure

### Applications
- `apps/astra/`: Next.js 15+ implementation with integrated `/api/chat` route.

### Shared Libraries
- `libs/chat-ui/`: Shared React UI components (Radix, Tailwind).
- `libs/chat-hooks/`: Shared React hooks for chat functionality.
- `libs/shared-types/`: Shared TypeScript interfaces.
- `libs/shared-utils/`: Shared utilities and AI provider configurations.

## Application Architecture

### AI Integration
- **Astra AI Client (`apps/astra`):** Uses the Vercel AI SDK for streaming chat responses.
  - API Route: `apps/astra/src/app/(chat)/api/chat/route.ts`
  - Uses `streamText` for real-time interaction.
  - Requires Vertex AI Application Default Credentials (ADC).
- **Architectural Pattern for AI SDKs:**
  - **Shared Config:** Store non-sensitive metadata (model names, provider IDs) in `libs/shared-utils/src/lib/ai-model-config.ts`.
  - **Server-Only Logic:** Store model factory logic in `libs/shared-utils/src/lib/ai-providers.ts`.
  - **Bundling Protection:** Use sub-path exports (e.g., `@ai-enhanced-web-apps/shared-utils/ai-providers`) for server-side code to avoid browser bundling errors.

## Building and Running

Commands are typically executed via Nx.

### Development

```sh
npx nx dev astra
```

### Build

```sh
npx nx build astra
```

## Development Conventions

- **Module Boundaries:** Strictly enforced via `@nx/enforce-module-boundaries`.
- **TypeScript:** Strict mode enabled.
- **Styling:** Tailwind utility classes are preferred.

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

- **Context7** - Always use Context7 MCP when writing or explaining code that involves external libraries or frameworks.

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

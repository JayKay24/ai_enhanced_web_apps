# Project Context: ChatClientReact

This project is an Nx-based monorepo designed for building AI-enhanced web applications. It uses a modern frontend stack with React 19, Vite, and Tailwind CSS.

## Project Overview

- **Monorepo Tool:** [Nx](https://nx.dev)
- **Framework:** React 19
- **Build Tool:** [Vite](https://vitejs.dev)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Testing:**
  - Unit/Component: [Vitest](https://vitest.dev)
  - End-to-End: [Playwright](https://playwright.dev)
- **Linting & Formatting:** [ESLint](https://eslint.org) (Flat config) and [Prettier](https://prettier.io)

## Directory Structure

- `apps/chat-client-react/`: The main React application.
- `apps/chat-client-react-e2e/`: End-to-end testing suite for the main application.
- `node_modules/`: Project dependencies.
- `nx.json`: Nx workspace configuration.
- `tsconfig.base.json`: Base TypeScript configuration for the workspace.

## Building and Running

Commands are typically executed via Nx.

### Development

```sh
# Run the main application in development mode
npx nx serve chat-client-react
```

### Build

```sh
# Create a production build of the main application
npx nx build chat-client-react
```

### Testing

```sh
# Run unit tests using Vitest
npx nx test chat-client-react

# Run E2E tests using Playwright
npx nx e2e chat-client-react-e2e
```

### Linting and Formatting

```sh
# Lint the project
npx nx lint chat-client-react

# Check formatting
npx prettier --check .
```

## Development Conventions

- **Module Boundaries:** The project uses `@nx/enforce-module-boundaries` to maintain a clean architecture. Ensure dependencies between apps and libraries follow the defined constraints in `nx.json` and `eslint.config.mjs`.
- **TypeScript:** Use strict TypeScript. Configurations are managed via `tsconfig.base.json` and project-specific `tsconfig.json` files.
- **Styling:** Prefer Tailwind utility classes for styling. Global styles are located in `apps/chat-client-react/src/styles.css`.
- **Testing:**
  - Write unit tests for business logic and component behavior using Vitest and `@testing-library/react`.
  - Use Playwright for critical path E2E tests.
- **Code Style:** ESLint and Prettier are used to enforce code style. Run linting and formatting checks before committing.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

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

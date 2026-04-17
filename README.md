# AI Enhanced Web Apps

This is an Nx-based monorepo for building AI-enhanced web applications. It features multiple chat clients integrated with a NestJS backend and Google Gemini 2.5 Flash via Vertex AI.

## Project Structure

### Applications
- `apps/chat-client-react`: A React 19 frontend application featuring the "Astra AI" chat interface. Built with Vite. Runs on port **4200**.
- `apps/chat-client-next`: A Next.js 15+ implementation with a built-in API route (`/api/chat`). Features parity with the React client. Runs on port **4300**.
- `apps/chat-server`: A NestJS backend serving as an AI gateway. Integrates with Vertex AI. Runs on port **3000**.
- `apps/chat-client-react-e2e`: Playwright E2E tests for the React application.
- `apps/chat-server-e2e`: Jest E2E tests for the backend.

### Libraries
- `libs/chat-ui`: Shared React components (Radix UI, Tailwind CSS).
- `libs/chat-hooks`: Shared React hooks for chat logic and keyboard shortcuts.
- `libs/shared-types`: Shared TypeScript interfaces and API contracts.
- `libs/shared-utils`: Shared utility functions (e.g., `cn`, `fetchAssistantResponse`).

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (for Vertex AI authentication)

### Authentication

Ensure you have Application Default Credentials (ADC) set up:
```bash
gcloud auth application-default login
```

### Installation

```bash
npm install
```

### Running the Applications

To run the React frontend:
```bash
npx nx serve chat-client-react
```

To run the Next.js frontend:
```bash
npx nx serve chat-client-next
```

To run the backend:
```bash
npx nx serve chat-server
```

## Running Tasks

Nx is used for running all tasks.

### Build

```bash
npx nx run-many -t build
```

### Test

```bash
# Run all tests
npx nx run-many -t test

# Run specific project tests
npx nx test chat-client-react
npx nx test chat-server
```

### Linting

```bash
npx nx run-many -t lint
```

## Documentation

For more detailed information on development workflows and guidelines, see [GEMINI.md](./GEMINI.md).

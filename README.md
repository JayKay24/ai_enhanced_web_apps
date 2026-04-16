# AI Enhanced Web Apps

This is an Nx-based monorepo for building AI-enhanced web applications. It features a React frontend and a NestJS backend.

## Project Structure

- `apps/chat-client-react`: A React 19 frontend application featuring a responsive chat interface called "Astra AI". It includes auto-scrolling, keyboard shortcuts (like '/' to focus), and integrates with the backend for real-time AI responses.
- `apps/chat-server`: A NestJS backend that serves as an AI gateway. It integrates with Google's Gemini Pro API (`gemini-1.5-flash`) to process chat messages and provides a simple REST API for the frontend.
- `apps/chat-client-react-e2e`: Playwright end-to-end tests for the frontend.
- `apps/chat-server-e2e`: Jest end-to-end tests for the backend.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
npm install
```

### Running the Applications

To run the frontend in development mode:
```bash
npx nx serve chat-client-react
```

To run the backend in development mode:
```bash
npx nx serve chat-server
```

## Running Tasks

Nx is used for running all tasks.

### Build

```bash
# Build frontend
npx nx build chat-client-react

# Build backend
npx nx build chat-server
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

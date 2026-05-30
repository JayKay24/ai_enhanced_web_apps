# `@ai-enhanced-web-apps/shared-utils`

A shared utility library containing tailwind styling helpers, cryptographic ID generators, model configurations, static prompts, and HTTP/AI client instances.

## Core Exports

### 1. Style Utilities (`cn`)
Combines `clsx` and `tailwind-merge` to resolve styling classes without conflicting Tailwind utilities.
```typescript
import { cn } from '@ai-enhanced-web-apps/shared-utils';
```

### 2. ID Generation (`generateUniqueId`)
Generates unique string identifiers for messages and file tokens:
```typescript
import { generateUniqueId } from '@ai-enhanced-web-apps/shared-utils';
```

### 3. AI Model Configurations (`SUPPORTED_PROVIDERS_CONFIG`)
Centralized metadata defining model configurations, names, and limits for Google Vertex AI and OpenAI. Helps dynamic UI selection components resolve backend adapters cleanly.

### 4. Static Prompts (`ai-prompts`)
Predefined system templates and instruction blocks (e.g., system instructions for Incident Report retrieval and Document Summarization agents).

### 5. Diagnostics & Error Tracking (`AIErrorTracker`)
Classes and wrappers tracking latency, rate limits, and network errors for AI API endpoint integration monitoring.

## Running Tasks

### Test
Run unit tests using Nx:
```bash
npx nx test @ai-enhanced-web-apps/shared-utils
```

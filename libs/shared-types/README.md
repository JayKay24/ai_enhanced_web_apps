# `@ai-enhanced-web-apps/shared-types`

A shared TypeScript library containing TypeScript interfaces, types, and API contract declarations used across frontend clients, server routes, and backend CLI tools.

## Key Types & Interfaces

### 1. `MessageRole`
Represents the sender role of a message in a conversation thread:
```typescript
type MessageRole = 'system' | 'user' | 'assistant';
```

### 2. `Message`
Model representing a single conversation message in the system:
*   `id`: `string`
*   `role`: `MessageRole`
*   `content`: `string`
*   `created`: `Date | string` (optional)
*   `attachments`: List of file attachments, each specifying `url`, `contentType`, and optional `name`.

### 3. `ChatResponse`
API envelope representing a standardized assistant reply payload:
*   `message`: `Message`

### 4. `UIStateItem<T = any>`
A generic structure used to represent a single message item in the Vercel AI SDK's UI state:
*   `id`: `string`
*   `display`: `T` (e.g. React Node for UI display)
*   `role`: `MessageRole` (optional)

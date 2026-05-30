# `@ai-enhanced-web-apps/chat-ui`

A shared library of React UI components built using Radix UI primitives and Tailwind CSS. This library provides premium, reusable components for constructing conversational AI interfaces.

## Key Components

### 1. `WelcomeHeader`
A premium greeting banner styled with clean typography, supporting an emoji with accessible labels, a title, and subtitle.

### 2. `ModelSelector`
An interactive selector allowing users to switch between supported AI providers (e.g., Google Vertex AI, OpenAI) and models (e.g., `gemini-2.5-flash`, `gpt-4o`).

### 3. `FileUploader`
A drag-and-drop upload zone supporting PDF and DOCX uploads, featuring upload progress, error boundaries, and file list previews.

### 4. `ChatList` & `ChatMessage`
Used to render the stream of dialogue. `ChatMessage` features distinct avatars for user/assistant roles, markdown rendering, and slide-in bubble animations.

### 5. `AutoScroll`
An anchor component designed to automatically scroll the message window down as new text tokens stream in, unless the user manually scrolls up.

### 6. `Weather`
A modular tool rendering component used as a standard target for client-side tool calling demonstrations.

## Usage Example

```tsx
import { WelcomeHeader, ModelSelector, ChatList, AutoScroll } from '@ai-enhanced-web-apps/chat-ui';

export function ChatLayout() {
  return (
    <div className="flex flex-col h-screen">
      <WelcomeHeader 
        emoji="🤖" 
        emojiLabel="robot" 
        title="Astra Assistant" 
        subtitle="Conversational AI Assistant" 
      />
      <ModelSelector 
        providerId={provider} 
        modelId={model} 
        onProviderChange={...} 
        onModelChange={...} 
      />
      <AutoScroll className="flex-1 overflow-y-auto">
        <ChatList messages={messages} />
      </AutoScroll>
    </div>
  );
}
```

## Running Tasks

### Test
Run unit and snapshot tests:
```bash
npx nx test @ai-enhanced-web-apps/chat-ui
```

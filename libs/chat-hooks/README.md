# `@ai-enhanced-web-apps/chat-hooks`

A shared React hooks library for conversational AI user interfaces. These hooks provide utility behaviors for forms, auto-scrolling, focus management, and keyboard shortcuts.

## Key Hooks

### 1. `useEnterSubmit`
Triggers form submission when the user presses the `Enter` key inside a textarea, while allowing new lines when `Shift+Enter` is pressed.
*   **Returns**: An object containing `formRef` and `onKeyDown` handler.

### 2. `useFocusOnSlashPress`
Auto-focuses an input or textarea element when the forward slash (`/`) key is pressed (unless the user is already typing in an input field).
*   **Returns**: A React `ref` to bind to the input element.

### 3. `useIsAtBottom`
Tracks if a container (like a scrollable chat area) is currently scrolled to the bottom.
*   **Returns**: A boolean indicating if the container is at the bottom, and a trigger function.

### 4. `useChatFormSubmit`
Manages submission state and action handlers for the chat input container.

## Usage Example

```tsx
import { useEnterSubmit, useFocusOnSlashPress } from '@ai-enhanced-web-apps/chat-hooks';

export function ChatInput() {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useFocusOnSlashPress<HTMLTextAreaElement>();

  return (
    <form ref={formRef} onSubmit={...}>
      <textarea
        ref={inputRef}
        onKeyDown={onKeyDown}
        placeholder="Type a message (Press '/' to focus)..."
      />
    </form>
  );
}
```

## Running Tasks

### Test
Run tests for this library using Nx:
```bash
npx nx test @ai-enhanced-web-apps/chat-hooks
```

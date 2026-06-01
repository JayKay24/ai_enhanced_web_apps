import { useMemo, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { logger } from '@ai-enhanced-web-apps/logger';
import { toast } from 'sonner';

/**
 * Custom React hook for managing the aviation incident RAG chatbot session.
 * Encapsulates client-side interactions with the Vercel AI SDK's useChat hook,
 * handles API request streaming, and transforms V6 parts-based message formats
 * into clean, presentation-ready message structures.
 * 
 * @returns An object containing:
 * - `messages`: Formatted chat list messages with content strings extracted from part structures.
 * - `isLoading`: Boolean state indicating whether an AI response is being submitted or streamed.
 * - `submitQuery`: A function to submit a user's text query to the RAG backend.
 * 
 * @example
 * ```tsx
 * const { messages, isLoading, submitQuery } = useAviationChat();
 * 
 * const handleSend = (text: string) => {
 *   submitQuery(text);
 * };
 * ```
 */
export function useAviationChat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (error) => {
      logger.error(error, 'Error in RAG submission:');
      let errorMessage = error.message || 'An error occurred during submission.';
      try {
        const parsed = JSON.parse(error.message);
        if (parsed && parsed.error) {
          errorMessage = parsed.error;
        }
      } catch {
        // Not JSON, use fallback message
      }
      toast.error(errorMessage);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const chatListMessages = useMemo(() => {
    return messages.map((m) => {
      let content = '';
      if (m.parts && Array.isArray(m.parts)) {
        for (const part of m.parts) {
          if (part.type === 'text') {
            content += part.text;
          }
        }
      }
      return {
        id: m.id,
        role: m.role,
        content,
      };
    });
  }, [messages]);

  const submitQuery = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    try {
      await sendMessage({ text: text.trim() });
    } catch (error) {
      logger.error(error, 'Error in RAG submission:');
      throw error;
    }
  }, [sendMessage, isLoading]);

  return {
    messages: chatListMessages,
    isLoading,
    submitQuery,
  };
}

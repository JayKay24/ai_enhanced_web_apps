import { useMemo, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export function useAviationChat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (error) => {
      console.error('Error in RAG submission:', error);
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
      console.error('Error in RAG submission:', error);
      throw error;
    }
  }, [sendMessage, isLoading]);

  return {
    messages: chatListMessages,
    isLoading,
    submitQuery,
  };
}

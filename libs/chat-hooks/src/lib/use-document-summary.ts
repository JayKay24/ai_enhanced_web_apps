import { useState, useCallback } from 'react';
import { generateUniqueId, fetchSummaryResponse } from '@ai-enhanced-web-apps/shared-utils';
import { Message } from '@ai-enhanced-web-apps/shared-types';

export function useDocumentSummary() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const summarizeDocument = useCallback(async (file: File | null, textInput: string) => {
    if (!file && !textInput.trim()) return;

    setIsLoading(true);

    const userMessageText = file
      ? `Uploaded file: ${file.name}`
      : textInput.trim();

    const userMessageId = generateUniqueId();
    const assistantMessageId = generateUniqueId();

    // Optimistic UI updates
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: userMessageId,
        role: 'user',
        content: userMessageText,
      },
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      },
    ]);

    const updateAssistantMessage = (accumulatedText: string) => {
      setMessages((currentMessages) =>
        currentMessages.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: accumulatedText }
            : msg
        )
      );
    };

    try {
      const response = await fetchSummaryResponse(file, textInput);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to generate summary.';
        try {
          const errJson = JSON.parse(errorText);
          errorMessage = `${errJson.error} (Request ID: ${errJson.requestId})`;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available.');
      }

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value: chunk, done: doneReading } = await reader.read();
        done = doneReading;
        if (chunk) {
          const chunkText = decoder.decode(chunk);
          accumulatedText += chunkText;
          updateAssistantMessage(accumulatedText);
        }
      }
    } catch (error: any) {
      console.error('Error in chat submission:', error);
      setMessages((currentMessages) =>
        currentMessages.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: `Error: ${error.message || 'Failed to complete summary.'}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    summarizeDocument,
  };
}


import { useState, useCallback } from 'react';
import { generateUniqueId, fetchSummaryResponse } from '@ai-enhanced-web-apps/shared-utils';
import { Message } from '@ai-enhanced-web-apps/shared-types';
import { logger } from '@ai-enhanced-web-apps/logger';

/**
 * Custom React hook to manage the state and process flow for document summarization.
 * Handles user input queries or PDF/DOCX file uploads, manages optimistic UI updates,
 * triggers API requests via fetch, and decodes the response body web stream chunk-by-chunk in real-time.
 * 
 * @returns An object containing:
 * - `messages`: Statically-typed chat list message array containing history and ongoing streams.
 * - `isLoading`: Boolean state indicating whether a summarization process is in progress.
 * - `summarizeDocument`: A callback function to submit either a file or raw text input to the summarizer backend.
 * 
 * @example
 * ```tsx
 * const { messages, isLoading, summarizeDocument } = useDocumentSummary();
 * 
 * const handleUpload = (file: File) => {
 *   summarizeDocument(file, '');
 * };
 * ```
 */
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
      logger.error(error, 'Error in chat submission:');
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


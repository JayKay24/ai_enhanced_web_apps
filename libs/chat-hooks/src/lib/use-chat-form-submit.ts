"use client";
import { useState, FormEvent } from 'react';
import { generateUniqueId } from '@ai-enhanced-web-apps/shared-utils';
import { Message, ChatResponse } from '@ai-enhanced-web-apps/shared-types';

/**
 * Hook to handle chat form submission and message state management.
 * @param getAssistantResponse Function to fetch the assistant's response.
 */
function useChatFormSubmit(
  getAssistantResponse: (text: string) => Promise<ChatResponse>
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the submission of the chat form.
   * @param e The form event.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value) return;

    setIsLoading(true);
    setInputValue('');

    const userMessage: Message = {
      content: value,
      role: 'user',
      id: generateUniqueId(),
    };
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    try {
      const { message } = await getAssistantResponse(value);
      setMessages((currentMessages) => [...currentMessages, message]);
    } catch (error) {
      console.error('Failed to get assistant response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleSubmit, inputValue, setInputValue };
}

export default useChatFormSubmit;

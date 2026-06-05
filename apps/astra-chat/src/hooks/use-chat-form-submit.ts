'use client';
import { useState, type FormEvent } from 'react';
import { generateUniqueId } from '../lib/generateUniqueId';
import { type Message } from '../components/chat/ChatList';

function useChatFormSubmit(
  getAssistantResponse: (text: string) => Promise<{ message: Message }>
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleSubmit, inputValue, setInputValue };
}

export default useChatFormSubmit;

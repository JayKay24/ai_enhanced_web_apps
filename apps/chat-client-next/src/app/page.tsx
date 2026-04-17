'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatResponse } from '@ai-enhanced-web-apps/shared-types';
import { v4 as uuidv4 } from 'uuid';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: inputValue,
      created: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data: ChatResponse = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col w-full max-w-4xl mx-auto py-24 stretch h-screen relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-32 px-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="mt-4 mb-16">
            <h1 className="text-6xl font-semibold leading-tight">
              Hello, I'm{" "}
              <span role="img" aria-label="eight-pointed star">
                ✴️
              </span>{" "}
              Astra
            </h1>
            <p className="text-6xl font-semibold text-gray-400">Ask me anything you want</p>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-5 flex flex-col gap-3 rounded-lg shadow-sm w-fit max-w-md ${
                message.role === 'assistant' 
                  ? 'mr-auto bg-white border border-gray-100' 
                  : 'ml-auto bg-blue-50 text-blue-900 border border-blue-100'
              }`}
            >
              <h5 className="text-lg font-semibold">
                {message.role === 'assistant' ? `✴️ Astra` : `👤 You`}
              </h5>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="mr-auto p-5 bg-white border border-gray-100 rounded-lg shadow-sm w-fit animate-pulse">
              <h5 className="text-lg font-semibold text-gray-300">✴️ Astra</h5>
              <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-4xl px-4 mb-8 bg-white"
      >
        <textarea
          className="w-full p-4 border border-gray-300 rounded-xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Type your message here..."
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      </form>
    </main>
  );
}

"use client";
import React from 'react';
import ChatMessage from './ChatMessage';
import ChatBubbleLoading from './ChatBubbleLoading';
import { Message } from '@ai-enhanced-web-apps/shared-types';

/**
 * Represents a message that contains a pre-rendered UI component (RSC pattern).
 */
export interface UIMessage {
  id: string;
  display?: React.ReactNode;
  products?: {
    name: string;
    description: string;
    price: number;
    category: string;
  }[];
}

/**
 * Props for the ChatList component.
 */
export interface ChatListProps {
  /** Array of messages to display (can be Message[] or UIMessage[]). */
  messages: (Message | UIMessage)[];
  /** Indicates if a new message is currently being loaded/generated. */
  isLoading: boolean;
}

/**
 * Renders a list of chat messages, including a loading indicator if applicable.
 */
const ChatList: React.FC<ChatListProps> = ({ messages, isLoading }) => {
  return (
    <ul className="flex flex-col gap-5">
      {messages.map((message) => (
        <li key={message.id}>
          {'display' in message && message.display ? (
            message.display
          ) : 'products' in message && message.products ? (
            <ChatMessage
              role="assistant"
              text="Here are some products related to your query:"
              width="w-full max-w-3xl"
              className="mr-auto"
            >
              <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Price</th>
                      <th className="border p-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {message.products.map((product, i) => (
                      <tr key={i} className="border-b">
                        <td className="border p-2">{product.name}</td>
                        <td className="border p-2">{product.description}</td>
                        <td className="border p-2">${product.price.toFixed(2)}</td>
                        <td className="border p-2">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChatMessage>
          ) : (
            <ChatMessage
              role={(message as Message).role}
              text={(message as Message).content}
              attachments={(message as Message).attachments}
              className={`${
                (message as Message).role === 'assistant' ? 'mr-auto' : 'ml-auto'
              } border-none`}
            />
          )}
        </li>
      ))}
      {isLoading && (
        <li key="loading-indicator">
          <ChatBubbleLoading />
        </li>
      )}
    </ul>
  );
};

export default ChatList;

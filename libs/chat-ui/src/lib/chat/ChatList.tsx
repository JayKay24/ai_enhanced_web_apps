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
  role?: 'user' | 'assistant';
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
      {messages.map((message) => {
        const isUIMessage = 'display' in message;
        const role = 'role' in message ? message.role : (message as Message).role;

        return (
          <li key={message.id}>
            {isUIMessage && message.display ? (
              role === 'assistant' ? (
                <ChatMessage role="assistant" text="" className="mr-auto">
                  {message.display}
                </ChatMessage>
              ) : (
                message.display
              )
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
        );
      })}
      {isLoading && (
        <li key="loading-indicator">
          <ChatBubbleLoading />
        </li>
      )}
    </ul>
  );
};

export default ChatList;

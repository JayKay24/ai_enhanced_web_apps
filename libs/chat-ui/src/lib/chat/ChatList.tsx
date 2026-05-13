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
  display: React.ReactNode;
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
          {'display' in message ? (
            message.display
          ) : (
            <ChatMessage
              role={message.role}
              text={message.content}
              attachments={message.attachments}
              className={`${
                message.role === 'assistant' ? 'mr-auto' : 'ml-auto'
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

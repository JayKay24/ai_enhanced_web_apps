"use client";
import React from 'react';
import ChatMessage from './ChatMessage';
import ChatBubbleLoading from './ChatBubbleLoading';

/**
 * Props for the ChatList component.
 */
export interface ChatListProps {
  /** Array of messages to display (can be Message[] or UIStateItem[]). */
  messages: any[];
  /** Indicates if a new message is currently being loaded/generated. */
  isLoading: boolean;
}

/**
 * Renders a list of chat messages, including a loading indicator if applicable.
 */
const ChatList: React.FC<ChatListProps> = ({ messages, isLoading }) => {
  return (
    <ul className="flex flex-col gap-5">
      {messages.map((message: any) => (
        <li key={message.id}>
          {message.display ? (
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

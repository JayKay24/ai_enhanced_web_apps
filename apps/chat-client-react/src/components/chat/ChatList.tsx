import React from 'react';
import ChatMessage from './ChatMessage';
import ChatBubbleLoading from './ChatBubbleLoading';

/**
 * Represents a single message in the chat.
 */
export interface Message {
  /** Unique identifier for the message. */
  id: string;
  /** The role of the message sender (e.g., 'user', 'assistant'). */
  role: string;
  /** The text content of the message. */
  content: string;
}

/**
 * Props for the ChatList component.
 */
export interface ChatListProps {
  /** Array of messages to display. */
  messages: Message[];
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
          <ChatMessage
            role={message.role}
            text={message.content}
            className={`${
              message.role === 'assistant' ? 'mr-auto' : 'ml-auto'
            } border-none`}
          />
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

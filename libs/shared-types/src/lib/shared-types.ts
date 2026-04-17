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
  /** Optional timestamp when the message was created. */
  created?: Date | string;
}

/**
 * Represents the response from the assistant.
 */
export interface ChatResponse {
  /** The message object returned by the assistant. */
  message: Message;
}

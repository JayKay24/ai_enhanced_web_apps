/**
 * The allowed roles for a message in the chat.
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Represents a single message in the chat.
 */
export interface Message {
  /** Unique identifier for the message. */
  id: string;
  /** The role of the message sender (e.g., 'user', 'assistant'). */
  role: MessageRole;
  /** The text content of the message. */
  content: string;
  /** Optional timestamp when the message was created. */
  created?: Date | string;
  /** Optional attachments (e.g., images). */
  attachments?: {
    url: string;
    contentType: string;
    name?: string;
  }[];
}

/**
 * Represents the response from the assistant.
 */
export interface ChatResponse {
  /** The message object returned by the assistant. */
  message: Message;
}

/**
 * Represents a single UI item in the AI SDK's UI state.
 */
export interface UIStateItem<T = any> {
  id: string;
  display?: T;
}

/**
 * Configuration for an interview session.
 */
export interface InterviewConfig {
  jobType: string;
  difficulty: string;
  questionType: string;
  questionCount: number;
}

/**
 * Represents an interview session.
 */
export interface InterviewSession extends InterviewConfig {
  id?: string;
  userId: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
  messages: Message[];
}

/**
 * Represents the response for interview session creation.
 */
export interface CreateInterviewSessionResponse {
  sessionId: string;
  initialAIState: Message[];
}

/**
 * Represents the response for fetching a single interview session.
 */
export interface FetchInterviewSessionResponse {
  session: InterviewSession;
  feedback: string | null;
}

/**
 * Represents the response for fetching all interview sessions.
 */
export interface FetchAllInterviewSessionsResponse {
  sessions: InterviewSession[];
}

/**
 * Represents the response for fetching feedback.
 */
export interface InterviewFeedbackResponse {
  feedback: string;
}

/**
 * Represents a text part in a message.
 */
export interface TextPart {
  type: 'text';
  text: string;
}

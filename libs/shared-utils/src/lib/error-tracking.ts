import { logger } from '@ai-enhanced-web-apps/logger';
import { generateUniqueId } from './generateUniqueId';

/**
 * Standard classification categories for AI API provider and pipeline errors.
 */
export enum ErrorType {
  /**
   * Request was blocked due to safety flags or content management policy violations.
   */
  CONTENT_FILTER = 'CONTENT_FILTER',
  /**
   * Model context size or token ceiling limits were exceeded.
   */
  TOKEN_LIMIT = 'TOKEN_LIMIT',
  /**
   * Request rate limit or quota limitations were encountered.
   */
  RATE_LIMIT = 'RATE_LIMIT',
  /**
   * Stream connection was closed unexpectedly or network issues occurred.
   */
  STREAM_ERROR = 'STREAM_ERROR',
  /**
   * Underlying LLM encountered an internal error during generation.
   */
  MODEL_ERROR = 'MODEL_ERROR',
  /**
   * Third-party provider endpoint returned a general API error.
   */
  API_ERROR = 'API_ERROR',
  /**
   * Fallback classification for unrecognized or generic exceptions.
   */
  UNKNOWN = 'UNKNOWN',
}

const ERROR_PATTERNS: Record<
  Exclude<ErrorType, ErrorType.UNKNOWN | ErrorType.MODEL_ERROR | ErrorType.API_ERROR>,
  string[]
> = {
  [ErrorType.CONTENT_FILTER]: [
    'content management policy',
    'content was filtered',
    'content policy violation',
    'safety',
    'filtered',
    'harmful',
  ],
  [ErrorType.TOKEN_LIMIT]: [
    'maximum context length',
    'max tokens exceeded',
    'token limit',
    'context length',
    'too many tokens',
  ],
  [ErrorType.RATE_LIMIT]: [
    'rate limit exceeded',
    'too many requests',
    'quota exceeded',
    '429',
    'exhausted',
  ],
  [ErrorType.STREAM_ERROR]: [
    'stream interrupted',
    'connection closed',
    'stream error',
    'network error',
  ],
};

/**
 * Structured details representing a tracked server-side error payload.
 */
export interface ErrorData {
  /**
   * Normalized classification category of the exception.
   */
  type: ErrorType;
  /**
   * The active provider handling the request.
   */
  provider?: string;
  /**
   * The targeted model name.
   */
  model?: string;
  /**
   * The detailed raw message of the exception.
   */
  message: string;
  /**
   * ISO string representation of when the error was tracked.
   */
  timestamp: string;
  /**
   * Unique identifier generated to trace logs corresponding to this request.
   */
  requestId: string;
  /**
   * Optional HTTP status code returned by the API client.
   */
  statusCode?: number;
  /**
   * Truncated/sanitized input query related to the error.
   */
  input?: string;
}

/**
 * Clean, safe error response delivered back to client interfaces.
 */
export interface UserFacingError {
  /**
   * Safe, non-technical customer feedback message.
   */
  message: string;
  /**
   * Unique Request ID for customer support referencing.
   */
  requestId: string;
}

/**
 * Utility namespace for inspecting, sanitizing, logging, and formatting server-side AI provider exceptions.
 */
export const AIErrorTracker = {
  /**
   * Inspects the exception structure and message patterns to classify the error type.
   * 
   * @param error - The raw thrown error object.
   * @returns The classified {@link ErrorType}.
   */
  determineErrorType(error: any): ErrorType {
    const message = (error?.message || '').toLowerCase();
    for (const [type, patterns] of Object.entries(ERROR_PATTERNS)) {
      if (patterns.some((pattern) => message.includes(pattern))) {
        return type as ErrorType;
      }
    }
    const status = error?.status || error?.statusCode;
    if (status === 429) {
      return ErrorType.RATE_LIMIT;
    }
    return ErrorType.UNKNOWN;
  },

  /**
   * Helper to truncate user inputs, preventing large payloads or credentials from polluting system logs.
   * 
   * @param input - The raw user input query.
   * @returns A sanitized/truncated string under 100 characters.
   */
  sanitizeInput(input?: string): string {
    if (!input) return '';
    if (input.length <= 100) return input;
    return input.substring(0, 100) + '...';
  },

  /**
   * Registers, logs, and processes a server-side exception, returning structured error data.
   * Outputs details using the shared `@ai-enhanced-web-apps/logger` Pino implementation.
   * 
   * @param error - The raw error object to track.
   * @param context - Additional request properties (provider, model, raw input).
   * @returns A promise resolving to the structured {@link ErrorData}.
   */
  async trackError(
    error: any,
    context: { provider?: string; model?: string; input?: string }
  ): Promise<ErrorData> {
    const errorType = this.determineErrorType(error);
    const timestamp = new Date().toISOString();
    const requestId = error?.requestId || `req_${generateUniqueId()}`;

    const errorData: ErrorData = {
      type: errorType,
      provider: context.provider,
      model: context.model,
      message: error?.message || 'Unknown error',
      timestamp,
      requestId,
      statusCode: error?.status || error?.statusCode,
      input: this.sanitizeInput(context.input),
    };

    logger.error({ err: error, errorData }, 'AI Provider Error');

    return errorData;
  },

  /**
   * Resolves a safe, non-technical customer feedback message mapped to the error type.
   * 
   * @param errorData - The structured server-side error data.
   * @returns The safe {@link UserFacingError} object.
   */
  createUserFacingError(errorData: ErrorData): UserFacingError {
    const messages: Record<ErrorType, string> = {
      [ErrorType.CONTENT_FILTER]:
        'Your request contained content that cannot be processed due to safety policies. Please modify and try again.',
      [ErrorType.TOKEN_LIMIT]: 'The request was too long. Please try with a shorter message or document.',
      [ErrorType.RATE_LIMIT]: 'Too many requests. Please try again in a moment.',
      [ErrorType.STREAM_ERROR]: 'Connection interrupted while streaming. Please try again.',
      [ErrorType.MODEL_ERROR]: 'The AI model encountered an error. Please try again.',
      [ErrorType.API_ERROR]: 'The AI service API returned an error. Please try again.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };

    return {
      message: messages[errorData.type] || messages[ErrorType.UNKNOWN],
      requestId: errorData.requestId,
    };
  },
};

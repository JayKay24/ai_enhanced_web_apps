import { logger } from '@ai-enhanced-web-apps/logger';
import { generateUniqueId } from './generateUniqueId';

export enum ErrorType {
  CONTENT_FILTER = 'CONTENT_FILTER',
  TOKEN_LIMIT = 'TOKEN_LIMIT',
  RATE_LIMIT = 'RATE_LIMIT',
  STREAM_ERROR = 'STREAM_ERROR',
  MODEL_ERROR = 'MODEL_ERROR',
  API_ERROR = 'API_ERROR',
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

export interface ErrorData {
  type: ErrorType;
  provider?: string;
  model?: string;
  message: string;
  timestamp: string;
  requestId: string;
  statusCode?: number;
  input?: string;
}

export interface UserFacingError {
  message: string;
  requestId: string;
}

export const AIErrorTracker = {
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

  sanitizeInput(input?: string): string {
    if (!input) return '';
    if (input.length <= 100) return input;
    return input.substring(0, 100) + '...';
  },

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

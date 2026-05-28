/**
 * Configuration schema for supported AI providers (Google Vertex AI, OpenAI) and their permitted models.
 */
export const SUPPORTED_PROVIDERS_CONFIG = {
  vertex: {
    name: 'Google Vertex AI',
    models: ['gemini-2.5-flash', 'gemini-1.5-pro'],
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
} as const;

/**
 * Union type representing the identifiers of the supported AI providers.
 */
export type ProviderId = keyof typeof SUPPORTED_PROVIDERS_CONFIG;

/**
 * The maximum permitted file size for document uploads (500 KB).
 */
export const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500 KB

/**
 * The user-facing error message displayed when an uploaded file exceeds the maximum size limit.
 */
export const FILE_SIZE_ERROR_MESSAGE = 'File size exceeds the 500 KB limit. Please upload a smaller document.';

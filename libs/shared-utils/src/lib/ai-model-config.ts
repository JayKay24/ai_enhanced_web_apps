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

export type ProviderId = keyof typeof SUPPORTED_PROVIDERS_CONFIG;

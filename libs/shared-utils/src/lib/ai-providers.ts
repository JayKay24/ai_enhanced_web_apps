import { createVertex } from '@ai-sdk/google-vertex';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';
import { SUPPORTED_PROVIDERS_CONFIG, ProviderId } from './ai-model-config';

const PROVIDER_FACTORIES = {
  vertex: () =>
    createVertex({
      project: process.env.VERTEX_AI_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    }),
  openai: () =>
    createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
} as const;

export function getModelInstance(providerId: string, modelId: string): LanguageModel {
  const config = SUPPORTED_PROVIDERS_CONFIG[providerId as ProviderId];
  if (!config) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }

  if (!(config.models as readonly string[]).includes(modelId)) {
    throw new Error(`Unsupported model ${modelId} for provider ${providerId}`);
  }

  const factory = PROVIDER_FACTORIES[providerId as ProviderId];
  return factory()(modelId);
}

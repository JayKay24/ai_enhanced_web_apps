import { createVertex } from '@ai-sdk/google-vertex';
import { createOpenAI } from '@ai-sdk/openai';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { SUPPORTED_PROVIDERS_CONFIG, ProviderId } from './ai-model-config';

const PROVIDER_FACTORIES: Record<ProviderId, () => any> = {
  vertex: () =>
    createVertex({
      project: process.env.VERTEX_AI_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    }),
  openai: () =>
    createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
};

export function getModelInstance(providerId: string, modelId: string): any {
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

/**
 * Returns a LangChain Chat Model instance for the given provider and model.
 */
export function getLangChainModelInstance(providerId: string, modelId: string): any {
  const config = SUPPORTED_PROVIDERS_CONFIG[providerId as ProviderId];
  if (!config) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }

  if (providerId === 'vertex') {
    return new ChatVertexAI({
      model: modelId,
      temperature: 0.7,
    });
  }

  throw new Error(`LangChain provider ${providerId} not yet implemented.`);
}

export * from './summarizer';


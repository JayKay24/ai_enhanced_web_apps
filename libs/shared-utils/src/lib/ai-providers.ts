import { createVertex } from '@ai-sdk/google-vertex';
import { createOpenAI } from '@ai-sdk/openai';
import { ChatVertexAI } from '@langchain/google-vertexai';
// Note: @langchain/openai might need to be installed for full functionality
// import { ChatOpenAI } from '@langchain/openai';
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

  // if (providerId === 'openai') {
  //   // Dynamically require to avoid bundling issues if not installed
  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-var-requires
  //     const { ChatOpenAI } = require('@langchain/openai');
  //     return new ChatOpenAI({
  //       modelName: modelId,
  //       temperature: 0.7,
  //     });
  //   } catch (e) {
  //     throw new Error('@langchain/openai is not installed. Please install it to use OpenAI with LangChain.');
  //   }
  // }

  throw new Error(`LangChain provider ${providerId} not yet implemented.`);
}

import { createVertex } from '@ai-sdk/google-vertex';
import { createOpenAI } from '@ai-sdk/openai';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { SUPPORTED_PROVIDERS_CONFIG, ProviderId } from './ai-model-config';
import { getGCPAuthOptions } from './gcp-auth';
export { getGCPAuthOptions };


const PROVIDER_FACTORIES: Record<ProviderId, () => any> = {
  vertex: () =>
    createVertex({
      project: process.env.GCP_PROJECT_ID || process.env.VERTEX_AI_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
      googleAuthOptions: getGCPAuthOptions(),
    }),
  openai: () =>
    createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
};

/**
 * Returns a configured Vercel AI SDK language model instance for the given provider and model IDs.
 * Checks configurations against allowed schemas in `SUPPORTED_PROVIDERS_CONFIG`.
 * 
 * @param providerId - Sibling provider ID (e.g. 'vertex', 'openai').
 * @param modelId - Target model name string.
 * @returns The Vercel AI SDK model instance.
 * @throws {@link Error} If the provider or model is not supported.
 * 
 * @example
 * ```typescript
 * const model = getModelInstance('vertex', 'gemini-2.5-flash');
 * ```
 */
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
 * Configuration options when instantiating a LangChain Chat Model.
 */
export interface LangChainModelOptions {
  /**
   * Output temperature representing randomness. Defaults to 0.7.
   */
  temperature?: number;
  /**
   * The maximum token ceiling limit for generated responses. Defaults to 2048.
   */
  maxOutputTokens?: number;
}

/**
 * Returns an instantiated LangChain Chat Model configured for the given provider and model IDs.
 * Automatically handles Application Default Credentials (ADC) and project/region context for Vertex AI.
 * 
 * @param providerId - Sibling provider ID (e.g. 'vertex').
 * @param modelId - Target model name string.
 * @param options - Custom overrides for temperature and output token limits.
 * @returns The LangChain Chat Model instance.
 * @throws {@link Error} If the provider is unsupported or unimplemented.
 * 
 * @example
 * ```typescript
 * const model = getLangChainModelInstance('vertex', 'gemini-2.5-flash', { temperature: 0 });
 * ```
 */
export function getLangChainModelInstance(
  providerId: string,
  modelId: string,
  options: LangChainModelOptions = {}
): any {
  const config = SUPPORTED_PROVIDERS_CONFIG[providerId as ProviderId];
  if (!config) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }

  if (providerId === 'vertex') {
    const project = process.env.GCP_PROJECT_ID || process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const authOpts = getGCPAuthOptions();

    return new ChatVertexAI({
      model: modelId,
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
      authOptions: authOpts
        ? {
            projectId: project,
            authClient: authOpts.authClient,
          }
        : {
            projectId: project,
          },
      location: location,
    });
  }

  throw new Error(`LangChain provider ${providerId} not yet implemented.`);
}

export * from './summarizer';

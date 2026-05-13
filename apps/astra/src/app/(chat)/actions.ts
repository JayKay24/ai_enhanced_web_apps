'use server';

import { streamText, ModelMessage } from 'ai';
import { createStreamableValue } from '@ai-sdk/rsc';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { ProviderId } from '@ai-enhanced-web-apps/shared-utils';

export async function continueConversation(
  history: ModelMessage[],
  provider: ProviderId,
  model: string,
) {
  'use server';

  const modelInstance = getModelInstance(provider, model);
  const stream = createStreamableValue();

  (async () => {
    try {
      const { textStream } = await streamText({
        model: modelInstance,
        messages: history,
      });

      for await (const text of textStream) {
        stream.update(text);
      }

      stream.done();
    } catch (error) {
      console.error('Error in continueConversation server action:', error);
      stream.error(error);
    }
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}

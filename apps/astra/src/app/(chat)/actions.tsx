'use server';

import React from 'react';
import { ModelMessage } from 'ai';
import { createAI, getMutableAIState, streamUI } from '@ai-sdk/rsc';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { 
  ProviderId, 
  getReasoningPromptCoreMessages 
} from '@ai-enhanced-web-apps/shared-utils';

export interface UIStateItem {
  id: string;
  display?: React.ReactNode;
  role?: 'user' | 'assistant';
}

export const continueConversation = async (
  input: string,
  files: { data: string; type: string }[],
  provider: ProviderId,
  model: string,
): Promise<UIStateItem> => {
  'use server';

  console.log('[continueConversation] START');

  const history = getMutableAIState<typeof AI>();

  // 1. Get the few-shot formatted messages
  const fewShotMessages = await getReasoningPromptCoreMessages(input);

  const modelInstance = getModelInstance(provider, model);
  if (!modelInstance) {
    throw new Error('Could not initialize AI model.');
  }

  const result = await streamUI({
    model: modelInstance,
    // We pass the few-shot messages followed by history if any
    // Note: In this specific implementation, the few-shot messages already include the current user question at the end.
    // If we have history, we might want to prepend it, but few-shot usually works best as a fresh start or with clear boundaries.
    // For now, we'll just use the few-shot messages for the current turn.
    messages: fewShotMessages as any,
    text: ({ content, done }) => {
      if (done) {
        history.done([
          ...history.get(),
          { role: 'user', content: input },
          { role: 'assistant', content },
        ]);
      }

      return <ChatMessage role="assistant" text={content} />;
    },
    onFinish: (result) => {
      console.log('[streamUI] FINISH. Reason:', result.finishReason);
    }
  });

  return {
    id: Date.now().toString(),
    display: result.value,
    role: 'assistant',
  };
};

export const AI = createAI<ModelMessage[], UIStateItem[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

'use server';

import React from 'react';
import { ModelMessage } from 'ai';
import { createAI, getMutableAIState, streamUI } from '@ai-sdk/rsc';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { ProviderId } from '@ai-enhanced-web-apps/shared-utils';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';

export interface UIStateItem {
  id: string;
  display: React.ReactNode;
}

export const continueConversation = async (
  input: string,
  files: { data: string; type: string }[],
  provider: ProviderId,
  model: string,
): Promise<UIStateItem> => {
  'use server';

  const history = getMutableAIState<typeof AI>();

  const userMessage: ModelMessage = {
    role: 'user',
    content: [
      { type: 'text', text: input },
      ...files.map((file) => ({
        type: 'image' as const,
        image: file.data,
        mimeType: file.type,
      })),
    ],
  };

  const modelInstance = getModelInstance(provider, model);

  const result = await streamUI({
    model: modelInstance,
    messages: [...history.get(), userMessage],
    text: ({ content, done }) => {
      if (done) {
        history.done([
          ...history.get(),
          userMessage,
          { role: 'assistant', content },
        ]);
      }

      return <ChatMessage role="assistant" text={content} className="mr-auto" />;
    },
  });

  return {
    id: Date.now().toString(),
    display: result.value,
  };
};

export const AI = createAI<ModelMessage[], UIStateItem[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

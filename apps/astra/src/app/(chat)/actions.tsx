'use server';

import React from 'react';
import { ModelMessage } from 'ai';
import { createAI, getMutableAIState } from '@ai-sdk/rsc';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { generateUniqueId } from '@ai-enhanced-web-apps/shared-utils';
import { processFile, summarizeText } from '@ai-enhanced-web-apps/shared-utils/ai-providers';

import { UIStateItem as BaseUIStateItem } from '@ai-enhanced-web-apps/shared-types';

export type UIStateItem = BaseUIStateItem<React.ReactNode>;

export const continueConversation = async (
  input: string | FormData
): Promise<UIStateItem> => {
  'use server';

  console.log('[continueConversation] START (Document Summarization - FormData Synchronous)');

  const history = getMutableAIState<typeof AI>();

  try {
    let summary: string;
    let userPromptDescription: string;

    if (input instanceof FormData) {
      const file = input.get('file') as File;

      if (!file) {
        throw new Error('No file uploaded.');
      }

      const fileType = file.type;
      const fileName = file.name;

      userPromptDescription = `Uploaded file: ${fileName}`;
      summary = await processFile(file, fileType);
    } else {
      userPromptDescription = input;
      summary = await summarizeText(input);
    }

    // Persist the interaction in the AI State history
    history.done([
      ...history.get(),
      { role: 'user', content: userPromptDescription },
      { role: 'assistant', content: summary },
    ]);

    return {
      id: generateUniqueId(),
      display: <ChatMessage role="assistant" text={summary} />,
      role: 'assistant',
    };
  } catch (error: any) {
    console.error('[continueConversation] Error:', error);
    
    return {
      id: generateUniqueId(),
      display: (
        <ChatMessage
          role="assistant"
          text={`An error occurred: ${error.message || 'Unknown error'}`}
          className="text-red-500"
        />
      ),
      role: 'assistant',
    };
  }
};

export const AI = createAI<ModelMessage[], UIStateItem[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

'use server';

import React from 'react';
import { ModelMessage } from 'ai';
import { createAI, getMutableAIState, createStreamableUI } from '@ai-sdk/rsc';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { generateUniqueId } from '@ai-enhanced-web-apps/shared-utils';
import { processFile, summarizeText } from '@ai-enhanced-web-apps/shared-utils/ai-providers';

export interface UIStateItem {
  id: string;
  display?: React.ReactNode;
  role?: 'user' | 'assistant' | 'system';
}

export const continueConversation = async (
  input: string | FormData
): Promise<UIStateItem> => {
  'use server';

  console.log('[continueConversation] START (Document Summarization)');

  const history = getMutableAIState<typeof AI>();
  const stream = createStreamableUI();

  // Run the summarization asynchronously so we can return the stream immediately
  (async () => {
    try {
      stream.update(
        <ChatMessage role="assistant" text="Reading and analyzing..." />
      );

      let summary: string;
      let userPromptDescription: string;

      if (input instanceof FormData) {
        const file = input.get('file') as Blob;
        const fileType = input.get('fileType') as string;
        const fileName = input.get('fileName') as string;

        if (!file || !fileType) {
          throw new Error('No file uploaded or file type is missing.');
        }

        stream.update(
          <ChatMessage role="assistant" text={`Reading ${fileName} and extracting text...`} />
        );
        userPromptDescription = `Uploaded file: ${fileName}`;
        summary = await processFile(file, fileType);
      } else {
        stream.update(
          <ChatMessage role="assistant" text="Summarizing text content..." />
        );
        userPromptDescription = input;
        summary = await summarizeText(input);
      }

      stream.update(
        <ChatMessage role="assistant" text={summary} />
      );
      stream.done();

      // Persist the interaction in the AI State history
      history.done([
        ...history.get(),
        { role: 'user', content: userPromptDescription },
        { role: 'assistant', content: summary },
      ]);
    } catch (error: any) {
      console.error('[continueConversation] Error:', error);
      stream.update(
        <ChatMessage
          role="assistant"
          text={`An error occurred: ${error.message || 'Unknown error'}`}
          className="text-red-500"
        />
      );
      stream.done();
    }
  })();

  return {
    id: generateUniqueId(),
    display: stream.value,
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

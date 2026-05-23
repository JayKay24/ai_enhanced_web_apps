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
  textInput: string,
  fileInput?: { name: string; type: string; data: string } | null
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

      if (fileInput) {
        const base64Data = fileInput.data.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid file data received.');
        }
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const fileBlob = new Blob([fileBuffer], { type: fileInput.type });

        stream.update(
          <ChatMessage role="assistant" text={`Reading ${fileInput.name} and extracting text...`} />
        );
        userPromptDescription = `Uploaded file: ${fileInput.name}`;
        summary = await processFile(fileBlob, fileInput.type);
      } else {
        stream.update(
          <ChatMessage role="assistant" text="Summarizing text content..." />
        );
        userPromptDescription = textInput;
        summary = await summarizeText(textInput);
      }

      stream.update(
        <ChatMessage role="assistant" text={summary} />
      );

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
    } finally {
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

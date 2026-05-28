'use server';

import React from 'react';
import { ModelMessage } from 'ai';
import { createAI, getMutableAIState } from '@ai-sdk/rsc';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { generateUniqueId, AIErrorTracker, MAX_FILE_SIZE_BYTES, FILE_SIZE_ERROR_MESSAGE } from '@ai-enhanced-web-apps/shared-utils';
import { processFile, summarizeText } from '@ai-enhanced-web-apps/shared-utils/ai-providers';

import { UIStateItem as BaseUIStateItem } from '@ai-enhanced-web-apps/shared-types';
import { logger } from '@ai-enhanced-web-apps/logger';

/**
 * React Server Component/RSC State Item wrapper representing a chat message node displayed in the UI list.
 */
export type UIStateItem = BaseUIStateItem<React.ReactNode>;

/**
 * Server Action that handles document summarization requests.
 * Evaluates whether input is FormData (representing a file upload) or a text query string,
 * processes the content via Vertex AI model instances, and returns a new UIStateItem update.
 * Enforces file size limitations and intercepts pipeline exceptions to present safe request ID tracking.
 * 
 * @param input - The text string query or FormData object containing the uploaded document file.
 * @returns A promise resolving to the assistant reply's {@link UIStateItem} node.
 */
export const continueConversation = async (
  input: string | FormData
): Promise<UIStateItem> => {
  'use server';

  logger.info('[continueConversation] START (Document Summarization - FormData Synchronous)');

  const history = getMutableAIState<typeof AI>();
  let userPromptDescription = typeof input === 'string' ? input : 'File upload';

  try {
    let summary: string;

    if (input instanceof FormData) {
      const file = input.get('file') as File;

      if (!file) {
        throw new Error('No file uploaded.');
      }

      // Server-side validation guard (500 KB limit)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
          id: generateUniqueId(),
          display: (
            <ChatMessage
              role="assistant"
              text={FILE_SIZE_ERROR_MESSAGE}
              className="text-amber-500 font-medium"
            />
          ),
          role: 'assistant',
        };
      }

      const fileType = file.type;
      const fileName = file.name;

      userPromptDescription = `Uploaded file: ${fileName}`;
      summary = await processFile(file, fileType);
    } else {
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
    const errorData = await AIErrorTracker.trackError(error, {
      provider: 'Google Vertex AI',
      model: 'gemini-2.5-flash',
      input: userPromptDescription,
    });
    const userError = AIErrorTracker.createUserFacingError(errorData);
    
    return {
      id: userError.requestId,
      display: (
        <ChatMessage
          role="assistant"
          text={`${userError.message} (Request ID: ${userError.requestId})`}
          className="text-red-500"
        />
      ),
      role: 'assistant',
    };
  }
};

/**
 * AI Context Provider interface managing conversational message states and server actions.
 */
export const AI = createAI<ModelMessage[], UIStateItem[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

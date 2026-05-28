'use server';

import React from 'react';
import { createAI, getMutableAIState } from '@ai-sdk/rsc';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { generateUniqueId, AIErrorTracker } from '@ai-enhanced-web-apps/shared-utils';
import { AviationRAG } from '@ai-enhanced-web-apps/rag';
import { UIStateItem as BaseUIStateItem } from '@ai-enhanced-web-apps/shared-types';
import { logger } from '@ai-enhanced-web-apps/logger';
import { ModelMessage } from 'ai';
import * as path from 'path';
import * as fs from 'fs';

/**
 * React Server Component/RSC State Item wrapper representing a chat message node displayed in the UI list.
 */
export type UIStateItem = BaseUIStateItem<React.ReactNode>;

let ragInstance: AviationRAG | null = null;

function getRAGInstance(): AviationRAG {
  if (!ragInstance) {
    ragInstance = new AviationRAG();
  }
  return ragInstance;
}

/**
 * Server Action that handles RAG query submissions to lookup NTSB incident reports.
 * Processes search queries against the local vector database and invokes Vertex AI model generation.
 * 
 * @param input - The search phrase or question entered by the user.
 * @returns A promise resolving to the assistant reply's {@link UIStateItem} node.
 */
export const continueConversation = async (
  input: string
): Promise<UIStateItem> => {
  'use server';

  logger.info('[continueConversation] START (Aviation Incident RAG)');

  const history = getMutableAIState<typeof AI>();

  try {
    const userQuery = input.trim();
    if (!userQuery) {
      throw new Error('Empty query provided.');
    }

    // Resolve RAG index path with default fallback
    let defaultIndexPath = path.join(
      process.cwd(),
      'src/assets/hnswlib-index'
    );
    if (!fs.existsSync(defaultIndexPath)) {
      defaultIndexPath = path.join(
        process.cwd(),
        'apps/astra-aviation-rag/src/assets/hnswlib-index'
      );
    }
    const indexPath = process.env.RAG_INDEX_PATH || defaultIndexPath;

    logger.info(`[continueConversation] Using index path: "${indexPath}"`);

    // Initialize RAG from shared library
    const rag = getRAGInstance();

    // Query RAG pipeline
    const responseText = await rag.query(indexPath, userQuery);

    // Persist the interaction in the AI State history
    history.done([
      ...history.get(),
      { role: 'user', content: userQuery },
      { role: 'assistant', content: responseText },
    ]);

    return {
      id: generateUniqueId(),
      display: <ChatMessage role="assistant" text={responseText} />,
      role: 'assistant',
    };
  } catch (error: any) {
    const errorData = await AIErrorTracker.trackError(error, {
      provider: 'Google Vertex AI',
      model: 'gemini-2.5-flash',
      input: input,
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

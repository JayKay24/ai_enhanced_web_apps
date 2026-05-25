'use server';

import React from 'react';
import { createAI, getMutableAIState } from '@ai-sdk/rsc';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { generateUniqueId } from '@ai-enhanced-web-apps/shared-utils';
import { AviationRAG } from '@ai-enhanced-web-apps/rag';
import { UIStateItem as BaseUIStateItem } from '@ai-enhanced-web-apps/shared-types';
import { ModelMessage } from 'ai';
import * as path from 'path';
import * as fs from 'fs';

export type UIStateItem = BaseUIStateItem<React.ReactNode>;

let ragInstance: AviationRAG | null = null;

function getRAGInstance(): AviationRAG {
  if (!ragInstance) {
    ragInstance = new AviationRAG();
  }
  return ragInstance;
}

export const continueConversation = async (
  input: string
): Promise<UIStateItem> => {
  'use server';

  console.log('[continueConversation] START (Aviation Incident RAG)');

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

    console.log(`[continueConversation] Using index path: "${indexPath}"`);

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
    console.error('[continueConversation] RAG Error:', error);
    
    return {
      id: generateUniqueId(),
      display: (
        <ChatMessage
          role="assistant"
          text={`An error occurred while querying the aviation incident database: ${error.message || 'Unknown error'}`}
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

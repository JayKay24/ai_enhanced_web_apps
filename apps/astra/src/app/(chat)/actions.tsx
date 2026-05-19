'use server';

import React from 'react';
import { ModelMessage } from 'ai';
import { createAI, getMutableAIState, createStreamableUI } from '@ai-sdk/rsc';
import { getLangChainModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { 
  ProviderId, 
  weatherPromptTemplate,
  fetchWeatherData,
  generateUniqueId
} from '@ai-enhanced-web-apps/shared-utils';
import { MessageRole } from '@ai-enhanced-web-apps/shared-types';
import { RunnableLambda } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

export interface UIStateItem {
  id: string;
  display?: React.ReactNode;
  role?: MessageRole;
}

export const continueConversation = async (
  input: string,
  files: { data: string; type: string }[],
  provider: ProviderId,
  model: string,
): Promise<UIStateItem> => {
  'use server';

  console.log('[continueConversation] START (LangChain Runnable)');

  const history = getMutableAIState<typeof AI>();
  const stream = createStreamableUI();

  // 1. Instantiate the LangChain model
  const llm = getLangChainModelInstance(provider, model);
  if (!llm) {
    throw new Error('Could not initialize LangChain AI model.');
  }

  // 2. Define the Runnable sequence
  const chain = RunnableLambda.from(fetchWeatherData)
    .pipe(weatherPromptTemplate)
    .pipe(llm)
    .pipe(new StringOutputParser());

  // 3. Process the stream in the background
  (async () => {
    try {
      stream.update(<ChatMessage role="assistant" text="Processing your request..." />);
      
      const aiResponseStream = await chain.stream({ city: input });
      let textContent = '';
      
      for await (const chunk of aiResponseStream) {
        textContent += chunk;
        stream.update(<ChatMessage role="assistant" text={textContent} />);
      }
      
      stream.done();
      
      // Update history for persistence
      history.done([
        ...history.get(),
        { role: 'user', content: input },
        { role: 'assistant', content: textContent },
      ]);
    } catch (error: any) {
      console.error('[continueConversation] Error:', error);
      stream.error(error);
    }
  })();

  // 4. Return the streamable UI immediately
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

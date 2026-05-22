'use server';

import React from 'react';
import { ModelMessage } from 'ai';
import { createAI, getMutableAIState, createStreamableUI } from '@ai-sdk/rsc';
import { getLangChainModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { 
  ProviderId, 
  generateUniqueId
} from '@ai-enhanced-web-apps/shared-utils';
import { MessageRole } from '@ai-enhanced-web-apps/shared-types';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

export interface UIStateItem {
  id: string;
  display?: React.ReactNode;
  role?: MessageRole;
}

const tools = [
  new WikipediaQueryRun({
    topKResults: 3,
    maxDocContentLength: 4000,
  }),
];

const AGENT_SYSTEM_TEMPLATE = `You are a helpful AI assistant specializing in technical queries and web technologies.
When using WikipediaQueryRun for searches:
1. Prioritize authoritative sources and official specifications.
2. Cross-reference information from multiple sources.
3. Format code examples using markdown.

Example interaction:
User: Irish Times
Action: WikipediaQueryRun(search="Irish Times")
Response: The Irish Times is an Irish daily broadsheet... [ details]`;

export const continueConversation = async (
  input: string,
  files: { data: string; type: string }[],
  provider: ProviderId,
  model: string,
): Promise<UIStateItem> => {
  'use server';

  console.log('[continueConversation] START (LangGraph Wikipedia Agent)');

  const history = getMutableAIState<typeof AI>();
  const stream = createStreamableUI();

  // 1. Instantiate the LangChain model
  const llm = getLangChainModelInstance(provider, model);
  if (!llm) {
    throw new Error('Could not initialize LangChain AI model.');
  }

  // 2. Instantiate the ReAct Agent
  const agent = createReactAgent({
    llm,
    tools,
    prompt: AGENT_SYSTEM_TEMPLATE,
  });

  // Helper to extract string content from Vercel AI SDK content format
  const getMessageContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('');
    }
    return '';
  };

  // 3. Map history messages to LangChain types
  const messages = history.get().map((msg) => {
    const textContent = getMessageContent(msg.content);
    if (msg.role === 'user') {
      return new HumanMessage(textContent);
    } else if (msg.role === 'assistant') {
      return new AIMessage(textContent);
    } else if (msg.role === 'system') {
      return new SystemMessage(textContent);
    }
    return new HumanMessage(textContent);
  });

  // Append current user input
  messages.push(new HumanMessage(input));

  // 4. Process the stream in the background
  (async () => {
    try {
      stream.update(<ChatMessage role="assistant" text="Processing your request..." />);

      const eventStream = agent.streamEvents(
        { messages },
        { version: 'v2' }
      );

      let textContent = '';
      let statusText = '';

      for await (const event of eventStream) {
        const eventType = event.event;

        if (eventType === 'on_tool_start') {
          const toolInput = event.data?.input?.input || event.data?.input?.query || JSON.stringify(event.data?.input) || '';
          const prefix = textContent ? '\n\n' : '';
          statusText = `${prefix}*(🔍 Searching Wikipedia for "${toolInput}"...)*`;
          stream.update(
            <ChatMessage
              role="assistant"
              text={textContent + statusText}
            />
          );
        } else if (eventType === 'on_tool_end') {
          statusText = '';
          stream.update(
            <ChatMessage
              role="assistant"
              text={textContent}
            />
          );
        } else if (eventType === 'on_chat_model_stream') {
          const chunk = event.data?.chunk;
          if (chunk?.content) {
            textContent += chunk.content;
            stream.update(<ChatMessage role="assistant" text={textContent + statusText} />);
          }
        }
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

  // 5. Return the streamable UI immediately
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

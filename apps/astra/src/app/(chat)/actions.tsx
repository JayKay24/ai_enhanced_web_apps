'use server';

import React from 'react';
import { ModelMessage, generateText, Output } from 'ai';
import { createAI, getMutableAIState, streamUI } from '@ai-sdk/rsc';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { ProviderId } from '@ai-enhanced-web-apps/shared-utils';
import { ChatMessage } from '@ai-enhanced-web-apps/chat-ui';
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
});

type Product = z.infer<typeof ProductSchema>;

export interface UIStateItem {
  id: string;
  display?: React.ReactNode;
  products?: Product[];
}

const ProductListSchema = z.array(ProductSchema);

export const generateProductList = async (
  prompt: string,
  provider: ProviderId,
  model: string,
) => {
  'use server';

  const modelInstance = getModelInstance(provider, model);

  const {
    output: { products },
  } = await generateText({
    model: modelInstance,
    output: Output.object({
      schema: z.object({
        products: ProductListSchema,
      }),
    }),
    prompt: `Generate a list of 5 products related to: ${prompt}. Provide name, description, price, and category for each product.`,
  });

  return products;
};

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
    generateProductList,
  },
  initialAIState: [],
  initialUIState: [],
});

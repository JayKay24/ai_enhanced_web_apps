'use server';

import React from 'react';
import { ModelMessage, generateText, Output } from 'ai';
import { createAI, getMutableAIState, streamUI } from '@ai-sdk/rsc';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { ProviderId } from '@ai-enhanced-web-apps/shared-utils';
import { WeatherCard, LoadingSpinner, fetchWeatherData } from '@ai-enhanced-web-apps/chat-ui';
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
  role?: 'user' | 'assistant';
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

  console.log('[continueConversation] START');

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
  if (!modelInstance) {
    throw new Error('Could not initialize AI model.');
  }

  const result = await streamUI({
    model: modelInstance,
    system: `
      You are Astra, a helpful weather assistant. 
      When a user asks about the weather in a specific city, you MUST use the 'getWeather' tool.
      Do not try to guess the weather. Always use the tool.
      Respond in a friendly and professional manner.
    `,
    messages: [...history.get(), userMessage],
    text: ({ content, done }) => {
      if (done) {
        history.done([
          ...history.get(),
          userMessage,
          { role: 'assistant', content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      getWeather: {
        description: 'Get the current weather for a specific city',
        inputSchema: z.object({
          city: z.string().describe('The name of the city'),
        }),
        generate: async function* ({ city }) {
          console.log(`[TOOL:getWeather] Called for: ${city}`);
          yield (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">Checking the weather in {city}...</p>
              <LoadingSpinner />
            </div>
          );
          
          try {
            const weatherData = await fetchWeatherData(city);
            console.log(`[TOOL:getWeather] Success for ${city}:`, weatherData);
            
            // Note: In a real app, you'd update history with the tool call and result here
            // using history.done() or similar, but for now we focus on the UI.
            
            return (
              <WeatherCard
                city={city}
                temperature={weatherData.temperature}
                condition={weatherData.condition}
              />
            );
          } catch (error) {
            console.error(`[TOOL:getWeather] Error for ${city}:`, error);
            return <div>Sorry, I encountered an error while fetching the weather for {city}.</div>;
          }
        },
      },
    },
    onFinish: (result) => {
      console.log('[streamUI] FINISH. Reason:', result.finishReason);
    }
  });

  return {
    id: Date.now().toString(),
    display: result.value,
    role: 'assistant',
  };
};

export const AI = createAI<ModelMessage[], UIStateItem[]>({
  actions: {
    generateProductList,
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

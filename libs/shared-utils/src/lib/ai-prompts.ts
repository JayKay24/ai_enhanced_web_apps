import {
  ChatPromptTemplate,
} from '@langchain/core/prompts';
import { BaseMessage } from '@langchain/core/messages';
import { MessageRole } from '@ai-enhanced-web-apps/shared-types';

// Define the weather prompt template for the chat interaction
export const weatherPromptTemplate = ChatPromptTemplate.fromMessages([
  ['system', "You are a friendly weather assistant. Use the provided weather data to answer the user's query."],
  ['human', "What's the weather like in {city}?"],
  [
    'assistant',
    "Here's the current weather data for {city}:\n" +
      'Temperature: {temperature}\n' +
      'Condition: {condition}\n' +
      'Humidity: {humidity}\n' +
      'Wind Speed: {windSpeed}\n' +
      'How would you like me to interpret this data for you?',
  ],
  [
    'human',
    "Give me a summary of the weather data. Use the provided weather data to answer the user's query. Follow the previous format.",
  ],
]);

/**
 * Formats the weather prompt with the given city name and mock data.
 * Returns an array of message objects compatible with LangChain.
 */
export async function getWeatherPromptMessages(city: string): Promise<BaseMessage[]> {
  return await weatherPromptTemplate.formatMessages({
    city,
    temperature: '75°F',
    condition: 'Sunny',
    humidity: '50%',
    windSpeed: '10 mph',
  });
}

/**
 * Formats the weather prompt and returns a plain string.
 */
export async function getWeatherPromptString(city: string) {
  return await weatherPromptTemplate.format({
    city,
    temperature: '75°F',
    condition: 'Sunny',
    humidity: '50%',
    windSpeed: '10 mph',
  });
}

/**
 * Formats the weather prompt and returns messages in Vercel AI SDK format.
 */
export async function getWeatherPromptCoreMessages(city: string) {
  const messages = await getWeatherPromptMessages(city);
  return messages.map((m) => {
    let role: MessageRole = 'user';
    if (m._getType() === 'system') role = 'system';
    else if (m._getType() === 'ai') role = 'assistant';
    else if (m._getType() === 'human') role = 'user';

    return {
      role,
      content: m.content as string,
    };
  });
}

/**
 * Mock function to fetch weather data for a city.
 * Used as the first step in a LangChain runnable sequence.
 */
export const fetchWeatherData = async (input: { city: string }) => ({
  city: input.city,
  temperature: '75°F',
  condition: 'Sunny',
  humidity: '50%',
  windSpeed: '10 mph',
});

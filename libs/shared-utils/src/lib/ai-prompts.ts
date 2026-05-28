import {
  ChatPromptTemplate,
} from '@langchain/core/prompts';
import { BaseMessage } from '@langchain/core/messages';
import { MessageRole } from '@ai-enhanced-web-apps/shared-types';

/**
 * LangChain ChatPromptTemplate configured with system instructions and human/assistant roles for weather inquiries.
 */
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
 * Formats the weather prompt template with the provided city name and mock weather data.
 * 
 * @param city - The target city name.
 * @returns A promise resolving to an array of LangChain {@link BaseMessage} objects.
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
 * Formats the weather prompt template with mock weather data and returns it as a plain text string.
 * 
 * @param city - The target city name.
 * @returns A promise resolving to the formatted prompt string.
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
 * Formats the weather prompt template and converts the resulting messages into the Vercel AI SDK Core message format.
 * 
 * @param city - The target city name.
 * @returns A promise resolving to an array of Vercel AI SDK compatible message objects.
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
 * A mock function representing an asynchronous fetch of current weather data for a specified city.
 * Frequently used as the initial stage in LangChain runnable chains.
 * 
 * @param input - Object containing the target city.
 * @returns A promise resolving to the mock weather properties.
 */
export const fetchWeatherData = async (input: { city: string }) => ({
  city: input.city,
  temperature: '75°F',
  condition: 'Sunny',
  humidity: '50%',
  windSpeed: '10 mph',
});

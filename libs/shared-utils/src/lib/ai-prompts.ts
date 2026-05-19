import {
  ChatPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from '@langchain/core/prompts';
import { BaseMessage } from '@langchain/core/messages';
import { MessageRole } from '@ai-enhanced-web-apps/shared-types';

// 1. Define the examples from the original few-shot-chain.js
const examples = [
  {
    question: "What is the primary ingredient in sushi?",
    answer: `\nAre follow-up questions needed here: No.\nSo the final answer is: Rice.`,
  },
  {
    question: "Who was the first person to walk on the moon?",
    answer: `\nAre follow-up questions needed here: No.\nSo the final answer is: Neil Armstrong.`,
  },
  {
    question: "What is the fastest land animal?",
    answer: `\nAre follow-up questions needed here: No.\nSo the final answer is: Cheetah.`,
  },
  {
    question: "What gas do plants primarily use for photosynthesis?",
    answer: `\nAre follow-up questions needed here: Yes.\nFollow-up: What process do plants perform?\nIntermediate answer: Plants primarily use carbon dioxide for photosynthesis.\nSo the final answer is: Carbon dioxide.`,
  },
];

// 2. Define how each example should be formatted for a chat model
const examplePrompt = ChatPromptTemplate.fromMessages([
  ['human', '{question}'],
  ['ai', '{answer}'],
]);

// 3. Create the few-shot prompt template
const fewShotPrompt = new FewShotChatMessagePromptTemplate({
  examplePrompt,
  examples,
  inputVariables: [], // The examples use 'question' and 'answer' internally
});

// 4. Assemble the final prompt using the original prefix as the system message
export const reasoningPromptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an intelligent assistant designed to answer questions accurately and concisely. Below are some examples of how to approach different types of questions. Pay attention to whether follow-up questions are needed and how the final answer is presented. After reviewing these examples, please answer the user's question in a similar format.

Remember:
1. Determine if follow-up questions are needed.
2. If yes, ask the follow-up and provide an intermediate answer.
3. Always conclude with a final answer.`,
  ],
  fewShotPrompt as any,
  ['human', '{input}'],
]);

/**
 * Formats the reasoning prompt with the given input.
 * Returns an array of message objects compatible with LangChain.
 */
export async function getReasoningPromptMessages(input: string): Promise<BaseMessage[]> {
  return await reasoningPromptTemplate.formatMessages({ input });
}

/**
 * Formats the reasoning prompt and returns a plain string.
 */
export async function getReasoningPromptString(input: string) {
  return await reasoningPromptTemplate.format({ input });
}

/**
 * Formats the reasoning prompt and returns messages in Vercel AI SDK format.
 */
export async function getReasoningPromptCoreMessages(input: string) {
  const messages = await getReasoningPromptMessages(input);
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

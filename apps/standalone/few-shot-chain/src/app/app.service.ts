import { Injectable, Logger } from '@nestjs/common';
import {
  ChatPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from '@langchain/core/prompts';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async demonstrateFewShotPrompting(): Promise<void> {
    this.logger.log('--- LangChain Few-Shot Prompt Formatting (Original Example) ---');

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
    const finalPrompt = ChatPromptTemplate.fromMessages([
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

    // 5. Format the prompt with the capital of Canada (original test case)
    const testInput = 'What is the capital of Canada?';
    this.logger.log(`Formatting prompt for input: "${testInput}"`);

    try {
      const formattedMessages = await finalPrompt.formatMessages({
        input: testInput,
      });

      console.log('\n--- Formatted Few-Shot Prompt (Message Objects) ---');
      console.log(JSON.stringify(formattedMessages, null, 2));
      console.log('--------------------------------------------------\n');

      const formattedString = await finalPrompt.format({
        input: testInput,
      });

      console.log('--- Formatted Few-Shot Prompt (String Representation) ---');
      console.log(formattedString);
      console.log('--------------------------------------------------------\n');
    } catch (error) {
      this.logger.error('Error formatting few-shot prompt', error);
      throw error;
    }
  }
}

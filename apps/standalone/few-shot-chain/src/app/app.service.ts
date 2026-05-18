import { Injectable, Logger } from '@nestjs/common';
import {
  ChatPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from '@langchain/core/prompts';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async demonstrateFewShotPrompting(): Promise<void> {
    this.logger.log('--- LangChain Few-Shot Prompt Formatting ---');

    // 1. Define your examples
    const examples = [
      {
        input: 'My internet connection is really slow. Can you help me?',
        output:
          "I'm sorry to hear that you're experiencing slow internet speeds. Let's troubleshoot this together. Can you please provide me with your current speed test results?",
      },
      {
        input: 'I was charged twice for my subscription this month. What happened?',
        output:
          'I understand how concerning double charges can be. Let me check your account details and resolve this issue for you right away.',
      },
    ];

    // 2. Define how each example should be formatted
    const examplePrompt = ChatPromptTemplate.fromMessages([
      ['human', '{input}'],
      ['ai', '{output}'],
    ]);

    // 3. Create the few-shot prompt template
    const fewShotPrompt = new FewShotChatMessagePromptTemplate({
      examplePrompt,
      examples,
      inputVariables: ['input'],
    });

    // 4. Assemble the final prompt
    const finalPrompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful customer support assistant.'],
      fewShotPrompt,
      ['human', '{input}'],
    ]);

    // 5. Format the prompt with a test input
    const testInput = 'My Wi-Fi keeps disconnecting every few minutes. What should I do?';
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

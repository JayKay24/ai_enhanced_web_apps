import { Injectable, Logger } from '@nestjs/common';
import {
  getReasoningPromptMessages,
  getReasoningPromptString,
} from '@ai-enhanced-web-apps/shared-utils';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async demonstrateFewShotPrompting(): Promise<void> {
    this.logger.log('--- LangChain Few-Shot Prompt Formatting (Shared Utils) ---');

    // 1. Format the prompt with the capital of Canada (original test case)
    const testInput = 'What is the capital of Canada?';
    this.logger.log(`Formatting prompt for input: "${testInput}"`);

    try {
      const formattedMessages = await getReasoningPromptMessages(testInput);

      console.log('\n--- Formatted Few-Shot Prompt (Message Objects) ---');
      console.log(JSON.stringify(formattedMessages, null, 2));
      console.log('--------------------------------------------------\n');

      const formattedString = await getReasoningPromptString(testInput);

      console.log('--- Formatted Few-Shot Prompt (String Representation) ---');
      console.log(formattedString);
      console.log('--------------------------------------------------------\n');
    } catch (error) {
      this.logger.error('Error formatting few-shot prompt', error);
      throw error;
    }
  }
}

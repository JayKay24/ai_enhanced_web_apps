import { Injectable } from '@nestjs/common';
import { encoding_for_model, TiktokenModel } from '@dqbd/tiktoken';

@Injectable()
export class AppService {
  countTokens(text: string, model: TiktokenModel = 'gpt-3.5-turbo'): number {
    const enc = encoding_for_model(model);
    const tokens = enc.encode(text);
    enc.free();
    return tokens.length;
  }

  async run() {
    const prompt =
      "Translate the following English text to French: 'Hello, how are you?'";
    const systemMessage =
      "You are a helpful assistant that translates English to French.";

    const promptTokens = this.countTokens(prompt);
    const systemTokens = this.countTokens(systemMessage);
    const totalTokens = promptTokens + systemTokens;

    console.log(`Prompt tokens: ${promptTokens}`);
    console.log(`System message tokens: ${systemTokens}`);
    console.log(`Total tokens: ${totalTokens}`);

    // Calculate remaining tokens for response (assuming a 4096 token limit)
    const maxTokens = 4096;
    const remainingTokens = maxTokens - totalTokens;
    console.log(`Remaining tokens for response: ${remainingTokens}`);
  }
}

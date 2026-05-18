import { Injectable, Logger } from '@nestjs/common';
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatVertexAI } from "@langchain/google-vertexai";

interface InputData {
  text: string;
}

interface UppercasedData {
  uppercased: string;
}

interface VowelCountData {
  vowelCount: number;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async executeChain(): Promise<void> {
    this.logger.log('--- LangChain Simple Chain (Vertex AI) Initializing ---');

    // 1. Initialize the Vertex AI model
    const model = new ChatVertexAI({
      model: "gemini-2.5-flash", // Updated to latest stable model
      project: process.env.VERTEX_AI_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION,
      temperature: 0,
    });

    // 2. Define custom runnables (Lambdas)
    const toUpperCase = RunnableLambda.from((input: InputData): UppercasedData => {
      this.logger.log(`Step 1: Uppercasing "${input.text}"`);
      return {
        uppercased: input.text.toUpperCase(),
      };
    });

    const vowelCountFunction = RunnableLambda.from((input: UppercasedData): VowelCountData => {
      const vowels = input.uppercased.match(/[AEIOU]/gi);
      const count = vowels ? vowels.length : 0;
      this.logger.log(`Step 2: Vowel count for "${input.uppercased}" is ${count}`);
      return {
        vowelCount: count,
      };
    });

    // 3. Define the prompt template
    const prompt = ChatPromptTemplate.fromTemplate(
      "The input had {vowelCount} vowels. Please say 'The vowel count is {vowelCount}' twice."
    );

    // 4. Construct the chain
    const chain = toUpperCase
      .pipe(vowelCountFunction)
      .pipe(prompt)
      .pipe(model)
      .pipe(new StringOutputParser());

    // 5. Invoke the chain
    const inputString = "Hello LangChain and Vertex AI";
    this.logger.log(`Invoking chain with input: "${inputString}"`);

    try {
      const output = await chain.invoke({ text: inputString });
      console.log('\n--- Final Output ---');
      console.log(output);
      console.log('--------------------\n');
    } catch (error) {
      this.logger.error('Error executing chain', error);
      throw error;
    }
  }
}

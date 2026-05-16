import { Injectable } from '@nestjs/common';
import { generateText } from 'ai';
import { vertex } from '@ai-sdk/google-vertex';

@Injectable()
export class AppService {
  async generateProgrammingLanguages(): Promise<void> {
    const prompt = `
List some popular programming languages along with a brief description of each:

1. JavaScript: A versatile language primarily used for web development.
2. Python: Known for its readability and used in data science and web development.
3. Java: A widely-used language for building enterprise-level applications.

4.`;

    const response = await generateText({
      model: vertex('gemini-2.5-flash', {
        project: process.env['VERTEX_AI_PROJECT_ID'],
        location: process.env['VERTEX_AI_LOCATION'],
      }),
      prompt: prompt,
      maxTokens: 512,
    });

    console.log("Generated Programming Languages:\n", response.text, "\n");
  }

  async supportCustomerIssue(message: string): Promise<void> {
    const system = `
You are a customer support chatbot. Adapt your tone and sentiment based on the following example interactions for each supported use case:

**Use Case 1: Technical Support**

**User:** My internet connection is really slow. Can you help me?

**Chatbot:** I'm sorry to hear that you're experiencing slow internet speeds. Let's troubleshoot this together. Can you please provide me with your current speed test results?

**Use Case 2: Billing Inquiry**

**User:** I was charged twice for my subscription this month. What happened?

**Chatbot:** I understand how concerning double charges can be. Let me check your account details and resolve this issue for you right away.

**Use Case 3: General Inquiry**

**User:** What are your customer support hours?

**Chatbot:** Our customer support team is available 24/7 to assist you with any questions you may have.
`;

    const response = await generateText({
      model: vertex('gemini-2.5-flash', {
        project: process.env['VERTEX_AI_PROJECT_ID'],
        location: process.env['VERTEX_AI_LOCATION'],
      }),
      prompt: message,
      system: system,
      maxTokens: 512,
    });

    console.log(`User: ${message}`);
    console.log("Chatbot Response:", response.text, "\n");
  }

  async run() {
    console.log("--- Generating Programming Languages (Few-Shot) ---");
    // await this.generateProgrammingLanguages();

    console.log("--- Customer Support Chatbot (Few-Shot System Prompt) ---");
    await this.supportCustomerIssue("My Wi-Fi keeps disconnecting every few minutes. What should I do?");
    // await this.supportCustomerIssue("I was charged for a service I didn't use. Can you help?");
    // await this.supportCustomerIssue("Can I change my shipping address after placing an order?");
    // await this.supportCustomerIssue("I'm locked out of my account. How can I regain access?");
  }
}

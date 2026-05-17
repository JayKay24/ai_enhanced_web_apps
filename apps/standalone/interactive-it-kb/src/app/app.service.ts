import { Injectable } from '@nestjs/common';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { embed, embedMany, cosineSimilarity } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';

@Injectable()
export class AppService {
  private readonly questions = [
    'How do I reset my password?',
    'What should I do if my computer won\'t start?',
    'How do I connect to the office VPN?',
    'Why is the internet so slow today?',
    'How do I request a new laptop?',
  ];

  private readonly answers = [
    'To reset your password, go to the login page and click "Forgot Password". Follow the instructions to reset your password.',
    'If your computer won\'t start, check the power cable, try restarting it, and if the issue persists, contact support.',
    'To connect to the VPN, open the Cisco AnyConnect client, enter "vpn.office.com", and sign in with your SSO credentials.',
    'Internet slowness can be due to high network traffic or local hardware issues. Try restarting your router or contact the IT helpdesk.',
    'You can request a new laptop through the employee portal under the "Equipment Request" section.',
  ];

  async executeInteractiveQuery(): Promise<void> {
    const google = createGoogleGenerativeAI({
      apiKey: process.env['GEMINI_API_KEY'],
    });

    const model = google.textEmbeddingModel('text-embedding-004');

    console.log('--- IT Knowledge Base Initializing ---');
    console.log('Generating embeddings for knowledge base...');

    // 1. Batch embed the questions
    const { embeddings: questionEmbeddings } = await embedMany({
      model,
      values: this.questions,
    });

    const rl = readline.createInterface({ input, output });

    try {
      const userQuery = await rl.question('\nEnter your IT query: ');

      if (!userQuery.trim()) {
        console.log('No query entered. Exiting.');
        return;
      }

      console.log(`Searching for: "${userQuery}"...`);

      // 2. Embed the user query
      const { embedding: queryEmbedding } = await embed({
        model,
        value: userQuery,
      });

      // 3. Find the most relevant answer using cosine similarity
      let maxSimilarity = -1;
      let bestIndex = -1;

      for (let i = 0; i < questionEmbeddings.length; i++) {
        const similarity = cosineSimilarity(queryEmbedding, questionEmbeddings[i]);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestIndex = i;
        }
      }

      console.log('\n--- Result ---');
      if (bestIndex !== -1 && maxSimilarity > 0.7) {
        console.log(`Matched Question: ${this.questions[bestIndex]}`);
        console.log(`Similarity Score: ${maxSimilarity.toFixed(3)}`);
        console.log(`\nAnswer: ${this.answers[bestIndex]}`);
      } else {
        console.log('No highly relevant answer found in the knowledge base.');
      }
    } finally {
      rl.close();
    }
  }
}

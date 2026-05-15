import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AppService {
  private ai: any;

  constructor() {
    const project = process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION;

    if (!project || !location) {
      console.warn('VERTEX_AI_PROJECT_ID or VERTEX_AI_LOCATION is not set. The application might fail to connect to Vertex AI.');
    }

    this.ai = new GoogleGenAI({
      vertexai: {
        project,
        location,
      },
    });
  }

  async countTextTokens(text: string) {
    try {
      const response = await this.ai.models.countTokens({
        model: 'gemini-2.0-flash',
        contents: [
          {
            parts: [{ text: text }],
          },
        ],
      });
      console.log(`Token count for "${text}":`, response.totalTokens);
    } catch (error) {
      console.error('Error counting tokens:', error);
    }
  }

  async countChatTokens(history: any[]) {
    try {
      const response = await this.ai.models.countTokens({
        model: 'gemini-2.0-flash',
        contents: history,
      });
      console.log('Chat history token count:', response.totalTokens);
    } catch (error) {
      console.error('Error counting chat tokens:', error);
    }
  }

  async getEmbedding(text: string) {
    try {
      const response = await this.ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: {
          parts: [{ text: text }],
        },
      });
      return response.embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      return null;
    }
  }

  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    const dotProduct = embedding1.reduce(
      (sum, value, index) => sum + value * embedding2[index],
      0
    );
    const magnitude1 = Math.sqrt(
      embedding1.reduce((sum, value) => sum + value * value, 0)
    );
    const magnitude2 = Math.sqrt(
      embedding2.reduce((sum, value) => sum + value * value, 0)
    );

    return dotProduct / (magnitude1 * magnitude2);
  }

  async run() {
    const questions = [
      'How do I reset my password?',
      "What should I do if my computer won't start?",
    ];

    const embeddingDB: Record<string, number[]> = {};

    for (const question of questions) {
      await this.countTextTokens(question);

      const embedding = await this.getEmbedding(question);
      if (embedding) {
        embeddingDB[question] = embedding.values; // @google/genai returns { values: number[] }
      }
    }

    const userQuery = 'I forgot my password';
    await this.countTextTokens(userQuery);
    const queryEmbedding = await this.getEmbedding(userQuery);

    if (queryEmbedding) {
      let maxSimilarity = -1;
      let mostRelevantQuestion = '';

      for (const [question, storedEmbedding] of Object.entries(embeddingDB)) {
        const similarity = this.cosineSimilarity(
          queryEmbedding.values,
          storedEmbedding
        );
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mostRelevantQuestion = question;
        }
      }

      console.log('Most relevant question:', mostRelevantQuestion);
    }

    const history = [
      { role: 'user', parts: [{ text: 'Hi my name is Bob' }] },
      { role: 'model', parts: [{ text: 'Hi Bob!' }] },
    ];

    await this.countChatTokens(history);

    const chat = this.ai.chats.create({
      model: 'gemini-2.0-flash',
      history: history,
    });

    const chatResponse = await chat.sendMessage({
      message: 'In one sentence, explain how a computer works to a young child.',
    });
    console.log('Chat response usage metadata:', chatResponse.usageMetadata);

    const combinedHistory = chat.getHistory();
    const extraMessage = {
      role: 'user',
      parts: [{ text: 'What is the meaning of life?' }],
    };
    combinedHistory.push(extraMessage);

    await this.countChatTokens(combinedHistory);
  }
}

import { Injectable } from '@nestjs/common';
import { embed } from 'ai';
import { createVertex } from '@ai-sdk/google-vertex';

@Injectable()
export class AppService {
  async run() {
    const projectId = process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    if (!projectId) {
      console.error('Error: VERTEX_AI_PROJECT_ID is not set.');
      return;
    }

    const vertex = createVertex({
      project: projectId,
      location: location,
    });

    const model = vertex.textEmbeddingModel('text-embedding-004');

    const inputText = `
List some popular programming languages along with a brief description of each:

1. JavaScript: A versatile language primarily used for web development.
2. Python: Known for its readability and used in data science and web development.
3. Java: A widely-used language for building enterprise-level applications.

4.
`;

    console.log('Generating embedding for text...');

    try {
      const { embedding } = await embed({
        model,
        value: inputText,
      });

      console.log('Embedding vector length:', embedding.length);
      console.log('First 10 embedding values:', embedding.slice(0, 10));
    } catch (error) {
      console.error('Error generating embedding:', error);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { embed } from 'ai';
import { createVertex } from '@ai-sdk/google-vertex';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  async run() {
    const projectId = process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    if (!projectId) {
      this.logger.error('Error: VERTEX_AI_PROJECT_ID is not set.');
      return;
    }

    const vertex = createVertex({
      project: projectId,
      location: location,
    });

    const model = vertex.embeddingModel('text-embedding-004');

    const inputText = `
List some popular programming languages along with a brief description of each:

1. JavaScript: A versatile language primarily used for web development.
2. Python: Known for its readability and used in data science and web development.
3. Java: A widely-used language for building enterprise-level applications.

4.
`;

    this.logger.log('Generating embedding for text...');

    try {
      const { embedding } = await embed({
        model,
        value: inputText,
      });

      this.logger.log('Embedding vector length:', embedding.length);
      this.logger.log('First 10 embedding values:', embedding.slice(0, 10));
    } catch (error) {
      this.logger.error('Error generating embedding:', error);
    }
  }
}

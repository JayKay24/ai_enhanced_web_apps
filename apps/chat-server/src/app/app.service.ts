import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { ChatResponse } from '@ai-enhanced-web-apps/shared-types';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const projectId = this.configService.get<string>('VERTEX_AI_PROJECT_ID');
    const location = this.configService.get<string>('VERTEX_AI_LOCATION') || 'us-central1';
    const credentialsPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');

    if (!projectId) {
      this.logger.error('VERTEX_AI_PROJECT_ID is not defined in the environment variables');
      throw new Error('Missing Vertex AI Project ID');
    }

    this.logger.log(`Initializing GoogleGenAI with Vertex AI (Project: ${projectId}, Location: ${location})`);
    
    if (credentialsPath) {
      this.logger.log(`Using GOOGLE_APPLICATION_CREDENTIALS from: ${credentialsPath}`);
    } else {
      this.logger.warn('GOOGLE_APPLICATION_CREDENTIALS not set; falling back to standard Application Default Credentials (ADC).');
      this.logger.warn('Ensure you have run: gcloud auth application-default login');
    }

    this.ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location: location,
    });
  }

  async getAssistantResponse(text: string): Promise<ChatResponse> {
    try {
      this.logger.log(`Received request text: ${text}`);

      // Switching to gemini-2.5-flash to avoid high demand on 2.5-flash
      const chat = this.ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
          {
            role: 'user',
            parts: [{ text: 'Hello' }],
          },
          {
            role: 'model',
            parts: [
              {
                text: "I'm happy to assist you in any way I can. How can I be of service today?",
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage({
        message: text,
      });

      const responseMessage = result.text || '';

      this.logger.log(`Assistant response: ${responseMessage}`);

      return {
        message: {
          id: uuidv4(),
          created: new Date(),
          role: 'assistant',
          content: responseMessage,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error in getAssistantResponse: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error in getAssistantResponse: ${error}`);
      }
      throw error;
    }
  }

  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}

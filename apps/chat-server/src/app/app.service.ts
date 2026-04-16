import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined in the environment variables');
    }
    this.ai = new GoogleGenAI({
      apiKey: apiKey || '',
    });
  }

  async getAssistantResponse(text: string) {
    try {
      this.logger.log(`Received request text: ${text}`);

      // Switching to gemini-2.0-flash to avoid high demand on 2.5-flash
      const chat = this.ai.chats.create({
        model: 'gemini-2.0-flash',
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

      const responseMessage = result.text;

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

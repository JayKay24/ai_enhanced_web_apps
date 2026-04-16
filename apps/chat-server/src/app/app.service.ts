import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined in the environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async getAssistantResponse(text: string) {
    try {
      this.logger.log(`Received request text: ${text}`);

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
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

      const result = await chat.sendMessage(text);
      const responseMessage = result.response.text();

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

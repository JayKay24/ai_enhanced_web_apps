import { Controller, Get, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatResponse } from '@ai-enhanced-web-apps/shared-types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post()
  async getAssistantResponse(@Body('text') text: string): Promise<ChatResponse> {
    try {
      return await this.appService.getAssistantResponse(text);
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}

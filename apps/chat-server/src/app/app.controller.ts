import { Controller, Get, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post()
  async getAssistantResponse(@Body('text') text: string) {
    try {
      return await this.appService.getAssistantResponse(text);
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}

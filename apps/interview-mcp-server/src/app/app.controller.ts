import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service';

@Controller()
export class AppController {
  constructor(private readonly mcpService: McpService) {}

  @Get('sse')
  async sse(@Req() req: Request, @Res() res: Response) {
    await this.mcpService.handleSseConnection(req, res);
  }

  @Post('message')
  async message(@Req() req: Request, @Res() res: Response) {
    await this.mcpService.handleMessage(req, res);
  }
}

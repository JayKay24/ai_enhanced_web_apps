import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpService } from './mcp.service';

@Controller('mcp')
export class AppController {
  constructor(private readonly mcpService: McpService) {}

  @Get()
  async get(@Req() req: Request, @Res() res: Response) {
    await this.mcpService.handleRequest(req, res);
  }

  @Post()
  async post(@Req() req: Request, @Res() res: Response) {
    await this.mcpService.handleRequest(req, res);
  }
}

import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpCoreService } from './mcp-core/mcp-core.service';

@Controller('mcp')
export class AppController {
  constructor(private readonly mcpCoreService: McpCoreService) {}

  @Get()
  async get(@Req() req: Request, @Res() res: Response) {
    await this.mcpCoreService.handleRequest(req, res);
  }

  @Post()
  async post(@Req() req: Request, @Res() res: Response) {
    await this.mcpCoreService.handleRequest(req, res);
  }
}

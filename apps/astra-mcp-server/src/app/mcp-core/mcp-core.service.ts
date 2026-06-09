import { Injectable, OnModuleInit, OnApplicationBootstrap } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Request, Response } from 'express';
import { logger } from '@ai-enhanced-web-apps/logger';
import { randomUUID } from 'crypto';

@Injectable()
export class McpCoreService implements OnModuleInit, OnApplicationBootstrap {
  private server!: McpServer;
  private transport!: StreamableHTTPServerTransport;

  onModuleInit() {
    this.server = new McpServer({
      name: 'astra-mcp-server',
      version: '1.0.0',
    });

    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });
  }

  async onApplicationBootstrap() {
    await this.server.connect(this.transport);
    logger.info('MCP Server initialized with StreamableHTTPServerTransport (Stateful)');
  }

  getServer(): McpServer {
    return this.server;
  }

  async handleRequest(req: Request, res: Response) {
    // Pass req.body if it exists because NestJS may have already parsed it
    await this.transport.handleRequest(req, res, req.body);
  }
}

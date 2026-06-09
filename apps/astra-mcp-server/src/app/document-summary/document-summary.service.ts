import { Injectable, OnModuleInit } from '@nestjs/common';
import { McpCoreService } from '../mcp-core/mcp-core.service';
import { z } from 'zod';
import { logger } from '@ai-enhanced-web-apps/logger';

@Injectable()
export class DocumentSummaryService implements OnModuleInit {
  constructor(private readonly mcpCoreService: McpCoreService) {}

  onModuleInit() {
    const server = this.mcpCoreService.getServer();

    server.registerTool(
      'summarize-document-placeholder',
      {
        description: 'Summarize a given text document (placeholder).',
        inputSchema: z.object({
          text: z.string().describe('The text to summarize.'),
        }),
      },
      async ({ text }) => {
        logger.info('Summarizing document via MCP (placeholder)');
        
        return {
          content: [
            {
              type: 'text',
              text: `[Placeholder Summary]: The provided document contains ${text.length} characters.`,
            },
          ],
        };
      }
    );

    logger.info('Registered Document Summary MCP tools');
  }
}

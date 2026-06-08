import { Injectable, OnModuleInit } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import { Request, Response } from 'express';
import { logger } from '@ai-enhanced-web-apps/logger';

const MOCK_QUESTIONS = [
  { id: 1, difficulty: 'easy', text: 'What is the Virtual DOM in React?' },
  { id: 2, difficulty: 'easy', text: 'Explain CSS specificity and how it is calculated.' },
  { id: 3, difficulty: 'easy', text: 'What is the difference between let, const, and var?' },
  { id: 4, difficulty: 'easy', text: 'What are semantic HTML tags and why are they important?' },
  { id: 5, difficulty: 'medium', text: 'How does event delegation work in JavaScript?' },
  { id: 6, difficulty: 'medium', text: 'What are React Hooks and why were they introduced?' },
  { id: 7, difficulty: 'medium', text: 'Explain the concept of closures in JavaScript with an example.' },
  { id: 8, difficulty: 'hard', text: 'How would you optimize the performance of a large-scale React application?' },
  { id: 9, difficulty: 'hard', text: 'Explain the Event Loop, task queue, and microtask queue in the browser.' },
  { id: 10, difficulty: 'hard', text: 'How do you handle complex state management in a frontend application?' },
];

@Injectable()
export class McpService implements OnModuleInit {
  private server!: McpServer;
  private transport: SSEServerTransport | null = null;

  onModuleInit() {
    this.server = new McpServer({
      name: 'interview-mcp-server',
      version: '1.0.0',
    });

    this.server.tool(
      'get-interview-questions',
      'Fetch frontend-focused technical interview questions based on difficulty.',
      {
        difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the questions to fetch.'),
        count: z.number().min(1).max(10).optional().describe('Number of questions to fetch, max 10.'),
      },
      async ({ difficulty, count = 1 }) => {
        logger.info({ difficulty, count }, 'Fetching interview questions via MCP');
        const filtered = MOCK_QUESTIONS.filter((q) => q.difficulty === difficulty);
        
        // Return up to count questions
        const questions = filtered.slice(0, count);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(questions, null, 2),
            },
          ],
        };
      }
    );
    logger.info('MCP Server initialized with get-interview-questions tool');
  }

  async handleSseConnection(req: Request, res: Response) {
    logger.info('New SSE connection established');
    this.transport = new SSEServerTransport('/message', res);
    await this.server.connect(this.transport);
  }

  async handleMessage(req: Request, res: Response) {
    if (this.transport) {
      await this.transport.handlePostMessage(req, res);
    } else {
      logger.warn('Received message but no active SSE connection');
      res.status(400).send('No active SSE connection');
    }
  }
}

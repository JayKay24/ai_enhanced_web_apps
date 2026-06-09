import { Injectable, OnModuleInit } from '@nestjs/common';
import { McpCoreService } from '../mcp-core/mcp-core.service';
import { z } from 'zod';
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
export class InterviewService implements OnModuleInit {
  constructor(private readonly mcpCoreService: McpCoreService) {}

  onModuleInit() {
    const server = this.mcpCoreService.getServer();

    server.registerTool(
      'get-interview-questions',
      {
        description: 'Fetch frontend-focused technical interview questions based on difficulty.',
        inputSchema: z.object({
          difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the questions to fetch.'),
          count: z.number().min(1).max(10).optional().describe('Number of questions to fetch, max 10.'),
        }),
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

    logger.info('Registered Interview MCP tools');
  }
}

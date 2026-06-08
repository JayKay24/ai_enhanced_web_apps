import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { convertToModelMessages, generateId, streamText } from 'ai';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { logger } from '@ai-enhanced-web-apps/logger';
import { Redis } from '@upstash/redis';
import { InterviewSession } from '@ai-enhanced-web-apps/shared-types';
import { createMCPClient } from '@ai-sdk/mcp';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export const dynamic = 'force-dynamic';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req: NextRequest) {
  logger.info('[POST /api/chat] START (Interview Assistant)');
  const { userId } = await auth();
  if (!userId) {
    logger.warn('[POST /api/chat] Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('No messages provided', { status: 400 });
    }

    let session: InterviewSession | null = null;
    if (sessionId) {
      const sessionKey = `session:${sessionId}`;
      session = (await redis.hgetall(sessionKey)) as InterviewSession | null;
      if (session && session.userId === userId && !session.isCompleted) {
        const updatedMessages = [...(session.messages || []), messages[messages.length - 1]];
        await redis.hset(sessionKey, {
          ...session,
          messages: updatedMessages,
          updatedAt: Date.now(),
        });
      }
    }

    const normalizedMessages = messages.map((m: any) => {
      if (!m.parts && typeof m.content === 'string') {
        return {
          ...m,
          parts: [{ type: 'text', text: m.content }],
        };
      }
      return m;
    });

    const coreMessages = await convertToModelMessages(normalizedMessages);
    const systemMessage = coreMessages.find((m) => m.role === 'system');
    const conversationMessages = coreMessages.filter((m) => m.role !== 'system');

    let mcpClient: any = null;
    let mcpTransport: StreamableHTTPClientTransport | null = null;
    let tools: Record<string, any> = {};

    if (session && session.jobType.toLowerCase() === 'frontend engineer' && session.questionType.toLowerCase() === 'technical') {
      try {
        const mcpUrl = process.env.INTERVIEW_MCP_SERVER_URL || 'http://127.0.0.1:4501/mcp';
        mcpTransport = new StreamableHTTPClientTransport(new URL(mcpUrl));
        
        // Add a setter for protocolVersion to satisfy @ai-sdk/mcp which attempts to set it directly
        Object.defineProperty(mcpTransport, 'protocolVersion', {
          get() {
            return (this as any)._protocolVersion;
          },
          set(version: string) {
            (this as any).setProtocolVersion(version);
          },
          configurable: true,
        });

        mcpClient = await createMCPClient({ transport: mcpTransport });
        tools = await mcpClient.tools();
      } catch (err) {
        logger.error({ err }, 'Failed to connect to MCP server');
      }
    }

    const result = streamText({
      model: getModelInstance('vertex', 'gemini-2.5-flash'), 
      system: systemMessage?.content as string | undefined,
      messages: conversationMessages,
      tools: Object.keys(tools).length > 0 ? tools : undefined,
      onFinish: async (event) => {
        if (sessionId) {
          const aiMessage = { id: generateId(), role: 'assistant', content: event.text };
          const sessionKey = `session:${sessionId}`;
          try {
            const session = (await redis.hgetall(sessionKey)) as InterviewSession | null;
            if (session && session.userId === userId) {
              const updatedMessages = [...(session.messages || []), aiMessage];
              await redis.hset(sessionKey, {
                ...session,
                messages: updatedMessages,
                updatedAt: Date.now(),
              });
            }
          } catch (err: unknown) {
            logger.error({ err }, 'Redis ai save error');
          }
        }
        
        if (mcpTransport) {
          try {
            await mcpTransport.close();
          } catch (e) {
            logger.error({ err: e }, 'Error closing MCP transport');
          }
        }
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during query execution.';
    logger.error({ err: error }, '[POST /api/chat] Error');
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

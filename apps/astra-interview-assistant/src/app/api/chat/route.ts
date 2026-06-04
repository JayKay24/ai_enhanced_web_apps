import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { streamText } from 'ai';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { logger } from '@ai-enhanced-web-apps/logger';
import { Redis } from '@upstash/redis';

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

    if (sessionId) {
      const sessionKey = `session:${sessionId}`;
      const session: any = await redis.hgetall(sessionKey);
      if (session && session.userId === userId && !session.isCompleted) {
        const updatedMessages = [...(session.messages || []), messages[messages.length - 1]];
        await redis.hset(sessionKey, {
          ...session,
          messages: updatedMessages,
          updatedAt: Date.now(),
        });
      }
    }

    const result = streamText({
      model: getModelInstance('vertex', 'gemini-1.5-pro'), 
      messages,
      onFinish: async (event) => {
        if (sessionId) {
          const aiMessage = { role: 'assistant', content: event.text };
          const sessionKey = `session:${sessionId}`;
          try {
            const session: any = await redis.hgetall(sessionKey);
            if (session && session.userId === userId) {
              const updatedMessages = [...(session.messages || []), aiMessage];
              await redis.hset(sessionKey, {
                ...session,
                messages: updatedMessages,
                updatedAt: Date.now(),
              });
            }
          } catch (err) {
            logger.error({ err }, 'Redis ai save error');
          }
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    logger.error({ err: error }, '[POST /api/chat] Error');
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during query execution.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

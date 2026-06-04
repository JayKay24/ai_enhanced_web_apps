import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateId, generateText } from 'ai';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { getInterviewSystemPrompt, getInterviewInitialMessage, getInterviewFeedbackPrompt } from '@ai-enhanced-web-apps/shared-utils';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();
  const { action, interviewConfig, sessionId } = body;

  if (action === 'create') {
    const { jobType, difficulty, questionType, questionCount } = interviewConfig;
    const newSessionId = generateId();

    const initialMessage = {
      id: generateId(),
      role: 'assistant',
      content: getInterviewInitialMessage(jobType, difficulty, questionType, questionCount),
      sessionId: newSessionId,
    };

    const systemPrompt = {
      role: 'system',
      content: getInterviewSystemPrompt(jobType, difficulty, questionType, questionCount),
    };

    await redis.hset(`session:${newSessionId}`, {
      ...interviewConfig,
      userId,
      isCompleted: false,
      createdAt: Date.now(),
      messages: [systemPrompt, initialMessage],
    });

    await redis.sadd(`user:sessions:${userId}`, newSessionId);
    return NextResponse.json({ sessionId: newSessionId, initialAIState: [initialMessage] });
  }

  if (action === 'complete') {
    const sessionKey = `session:${sessionId}`;
    const session: any = await redis.hgetall(sessionKey);

    if (!session || session.userId !== userId) {
      return new NextResponse('Session not found', { status: 404 });
    }

    if (!session.isCompleted) {
      await redis.hset(sessionKey, {
        ...session,
        isCompleted: true,
        completedAt: Date.now(),
      });
    }

    return NextResponse.json({ success: true });
  }

  if (action === 'feedback') {
    const sessionKey = `session:${sessionId}`;
    const session: any = await redis.hgetall(sessionKey);

    if (!session || session.userId !== userId) {
      return new NextResponse('Session not found', { status: 404 });
    }

    const messages = session.messages || [];
    const messagesFormatted = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
    const prompt = getInterviewFeedbackPrompt(messagesFormatted);

    try {
      const { text } = await generateText({
        model: getModelInstance('vertex', 'gemini-1.5-pro'),
        prompt,
      });
      
      const feedbackKey = `feedback:${sessionId}`;
      await redis.set(feedbackKey, text);
      
      return NextResponse.json({ feedback: text });
    } catch (err: any) {
      return new NextResponse(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new NextResponse('Invalid action', { status: 400 });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');

  if (sessionId) {
    const session: any = await redis.hgetall(`session:${sessionId}`);
    if (!session || session.userId !== userId) {
      return new NextResponse('Session not found', { status: 404 });
    }
    const feedback = await redis.get(`feedback:${sessionId}`);
    return NextResponse.json({ session, feedback });
  } else {
    const sessionIds = await redis.smembers(`user:sessions:${userId}`);
    const sessions = await Promise.all(
      sessionIds.map(async (id) => {
        const session: any = await redis.hgetall(`session:${id}`);
        return { ...session, id };
      })
    );
    sessions.sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ sessions });
  }
}

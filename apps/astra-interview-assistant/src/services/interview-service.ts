import { generateId, generateText } from 'ai';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { getInterviewSystemPrompt, getInterviewInitialMessage, getInterviewFeedbackPrompt } from '@ai-enhanced-web-apps/shared-utils';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function createSession(userId: string, interviewConfig: any) {
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
  return { sessionId: newSessionId, initialAIState: [initialMessage] };
}

export async function completeSession(userId: string, sessionId: string) {
  const sessionKey = `session:${sessionId}`;
  const session: any = await redis.hgetall(sessionKey);

  if (!session || session.userId !== userId) {
    throw new Error('Session not found or unauthorized');
  }

  if (!session.isCompleted) {
    await redis.hset(sessionKey, {
      ...session,
      isCompleted: true,
      completedAt: Date.now(),
    });
  }

  return { success: true };
}

export async function generateFeedback(userId: string, sessionId: string) {
  const sessionKey = `session:${sessionId}`;
  const session: any = await redis.hgetall(sessionKey);

  if (!session || session.userId !== userId) {
    throw new Error('Session not found or unauthorized');
  }

  const messages = session.messages || [];
  const messagesFormatted = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
  const prompt = getInterviewFeedbackPrompt(messagesFormatted);

  const { text } = await generateText({
    model: getModelInstance('vertex', 'gemini-1.5-pro'),
    prompt,
  });
  
  const feedbackKey = `feedback:${sessionId}`;
  await redis.set(feedbackKey, text);
  
  return { feedback: text };
}

export async function getSession(userId: string, sessionId: string) {
  const session: any = await redis.hgetall(`session:${sessionId}`);
  if (!session || session.userId !== userId) {
    throw new Error('Session not found or unauthorized');
  }
  const feedback = await redis.get(`feedback:${sessionId}`);
  return { session, feedback };
}

export async function getAllSessions(userId: string) {
  const sessionIds = await redis.smembers(`user:sessions:${userId}`);
  const sessions = await Promise.all(
    sessionIds.map(async (id) => {
      const session: any = await redis.hgetall(`session:${id}`);
      return { ...session, id };
    })
  );
  sessions.sort((a, b) => b.createdAt - a.createdAt);
  return { sessions };
}

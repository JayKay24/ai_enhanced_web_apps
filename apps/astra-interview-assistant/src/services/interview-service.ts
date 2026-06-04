import { generateId, generateText } from 'ai';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { getInterviewSystemPrompt, getInterviewInitialMessage, getInterviewFeedbackPrompt } from '@ai-enhanced-web-apps/shared-utils';
import { Redis } from '@upstash/redis';
import { 
  InterviewConfig, 
  InterviewSession, 
  CreateInterviewSessionResponse,
  FetchInterviewSessionResponse,
  FetchAllInterviewSessionsResponse,
  InterviewFeedbackResponse,
  Message 
} from '@ai-enhanced-web-apps/shared-types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Creates a new interview session for a user.
 * 
 * @param userId - The ID of the authenticated user creating the session.
 * @param interviewConfig - Configuration object detailing jobType, difficulty, questionType, and questionCount.
 * @returns An object containing the generated sessionId and initial AI message state.
 */
export async function createSession(
  userId: string, 
  interviewConfig: InterviewConfig
): Promise<CreateInterviewSessionResponse> {
  const { jobType, difficulty, questionType, questionCount } = interviewConfig;
  const newSessionId = generateId();

  const initialMessage: Message & { sessionId: string } = {
    id: generateId(),
    role: 'assistant',
    content: getInterviewInitialMessage(jobType, difficulty, questionType, questionCount),
    sessionId: newSessionId,
  };

  const systemPrompt: Message = {
    id: generateId(),
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

/**
 * Marks an active interview session as completed.
 * 
 * @param userId - The ID of the authenticated user completing the session.
 * @param sessionId - The unique identifier of the interview session to complete.
 * @returns An object indicating success.
 * @throws {Error} If the session is not found or the user is unauthorized.
 */
export async function completeSession(
  userId: string, 
  sessionId: string
): Promise<{ success: boolean }> {
  const sessionKey = `session:${sessionId}`;
  const session = (await redis.hgetall(sessionKey)) as InterviewSession | null;

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

/**
 * Generates AI feedback for a completed interview session using the full conversation history.
 * 
 * @param userId - The ID of the authenticated user.
 * @param sessionId - The unique identifier of the interview session.
 * @returns An object containing the generated feedback text.
 * @throws {Error} If the session is not found or the user is unauthorized.
 */
export async function generateFeedback(
  userId: string, 
  sessionId: string
): Promise<InterviewFeedbackResponse> {
  const sessionKey = `session:${sessionId}`;
  const session = (await redis.hgetall(sessionKey)) as InterviewSession | null;

  if (!session || session.userId !== userId) {
    throw new Error('Session not found or unauthorized');
  }

  const messages = session.messages || [];
  const messagesFormatted = messages.map((m: Message) => `${m.role}: ${m.content}`).join('\n');
  const prompt = getInterviewFeedbackPrompt(messagesFormatted);

  const { text } = await generateText({
    model: getModelInstance('vertex', 'gemini-1.5-pro'),
    prompt,
  });
  
  const feedbackKey = `feedback:${sessionId}`;
  await redis.set(feedbackKey, text);
  
  return { feedback: text };
}

/**
 * Retrieves a specific interview session and its associated feedback (if any).
 * 
 * @param userId - The ID of the authenticated user.
 * @param sessionId - The unique identifier of the interview session.
 * @returns An object containing the session data and the feedback text.
 * @throws {Error} If the session is not found or the user is unauthorized.
 */
export async function getSession(
  userId: string, 
  sessionId: string
): Promise<FetchInterviewSessionResponse> {
  const session = (await redis.hgetall(`session:${sessionId}`)) as InterviewSession | null;
  if (!session || session.userId !== userId) {
    throw new Error('Session not found or unauthorized');
  }
  const feedback = await redis.get<string>(`feedback:${sessionId}`);
  return { session, feedback };
}

/**
 * Retrieves all interview sessions for a specific user, sorted by creation date descending.
 * 
 * @param userId - The ID of the authenticated user.
 * @returns An object containing an array of the user's interview sessions.
 */
export async function getAllSessions(
  userId: string
): Promise<FetchAllInterviewSessionsResponse> {
  const sessionIds = await redis.smembers(`user:sessions:${userId}`);
  const sessions = await Promise.all(
    sessionIds.map(async (id): Promise<InterviewSession | null> => {
      const session = (await redis.hgetall(`session:${id}`)) as InterviewSession | null;
      return session ? { ...session, id } : null;
    })
  );
  const validSessions = sessions.filter((s): s is InterviewSession => s !== null);
  validSessions.sort((a, b) => b.createdAt - a.createdAt);
  return { sessions: validSessions };
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  createSession, 
  completeSession, 
  generateFeedback, 
  getSession, 
  getAllSessions 
} from '../../../services/interview-service';
import { InterviewConfig } from '@ai-enhanced-web-apps/shared-types';

export const dynamic = 'force-dynamic';

interface PostRequestBody {
  action: 'create' | 'complete' | 'feedback';
  interviewConfig?: InterviewConfig;
  sessionId?: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = (await req.json()) as PostRequestBody;
  const { action, interviewConfig, sessionId } = body;

  try {
    if (action === 'create') {
      if (!interviewConfig) {
        return new NextResponse('Missing interviewConfig', { status: 400 });
      }
      const result = await createSession(userId, interviewConfig);
      return NextResponse.json(result);
    }

    if (action === 'complete') {
      if (!sessionId) {
        return new NextResponse('Missing sessionId', { status: 400 });
      }
      const result = await completeSession(userId, sessionId);
      return NextResponse.json(result);
    }

    if (action === 'feedback') {
      if (!sessionId) {
        return new NextResponse('Missing sessionId', { status: 400 });
      }
      const result = await generateFeedback(userId, sessionId);
      return NextResponse.json(result);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('not found') || errorMessage.includes('unauthorized')) {
      return new NextResponse(errorMessage, { status: 404 });
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }

  return new NextResponse('Invalid action', { status: 400 });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');

  try {
    if (sessionId) {
      const result = await getSession(userId, sessionId);
      return NextResponse.json(result);
    } else {
      const result = await getAllSessions(userId);
      return NextResponse.json(result);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('not found') || errorMessage.includes('unauthorized')) {
      return new NextResponse(errorMessage, { status: 404 });
    }
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}


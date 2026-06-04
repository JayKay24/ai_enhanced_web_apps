import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  createSession, 
  completeSession, 
  generateFeedback, 
  getSession, 
  getAllSessions 
} from '../../../services/interview-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();
  const { action, interviewConfig, sessionId } = body;

  try {
    if (action === 'create') {
      const result = await createSession(userId, interviewConfig);
      return NextResponse.json(result);
    }

    if (action === 'complete') {
      const result = await completeSession(userId, sessionId);
      return NextResponse.json(result);
    }

    if (action === 'feedback') {
      const result = await generateFeedback(userId, sessionId);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return new NextResponse(error.message, { status: 404 });
    }
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
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
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return new NextResponse(error.message, { status: 404 });
    }
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}


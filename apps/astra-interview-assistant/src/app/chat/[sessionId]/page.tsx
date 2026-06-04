'use client';
import { useEffect, useState } from 'react';
import ChatThread from '../../../components/chat/ChatThread';
import { useParams } from 'next/navigation';
import { fetchInterviewSession } from '@ai-enhanced-web-apps/shared-utils';

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetchInterviewSession(sessionId)
      .then(d => setSession(d.session));
  }, [sessionId]);

  if (!session) return <div className="p-8 text-center text-gray-500">Loading Interview Session...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-1">Interview: {session.jobType}</h1>
      <p className="text-sm text-gray-500 mb-6">{session.difficulty} • {session.questionCount} Questions</p>
      <div className="border rounded-xl p-4 shadow-sm">
        <ChatThread sessionId={sessionId} initialMessages={session.messages} isCompleted={session.isCompleted} />
      </div>
    </div>
  );
}
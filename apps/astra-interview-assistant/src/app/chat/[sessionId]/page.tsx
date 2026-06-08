'use client';
import { useEffect, useState } from 'react';
import ChatThread from '../../../components/chat/ChatThread';
import { useParams } from 'next/navigation';
import { fetchInterviewSession } from '@ai-enhanced-web-apps/shared-utils';
import { InterviewSession } from '@ai-enhanced-web-apps/shared-types';
import { Briefcase, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@ai-enhanced-web-apps/chat-ui';

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    fetchInterviewSession(sessionId)
      .then(d => setSession(d.session));
  }, [sessionId]);

  if (!session) {
    return (
      <div className="flex items-center justify-center flex-1 h-[calc(100vh-3.5rem)] text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading Interview Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-3.5rem)] bg-slate-50/30 dark:bg-slate-900/10">
      {/* Premium Session Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="mr-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            <Link href="/chat" title="Back to configurator">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1">
              {session.jobType}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="font-medium bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded uppercase">
                {session.difficulty}
              </span>
              <span>•</span>
              <span>{session.questionCount} Questions</span>
              <span>•</span>
              <span className="capitalize">{session.questionType}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat layout */}
      <main className="flex-1 min-h-0 flex flex-col relative">
        <ChatThread 
          sessionId={sessionId} 
          initialMessages={session.messages} 
          isCompleted={session.isCompleted} 
        />
      </main>
    </div>
  );
}
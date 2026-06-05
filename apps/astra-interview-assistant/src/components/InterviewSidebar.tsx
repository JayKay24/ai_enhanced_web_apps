import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Redis } from '@upstash/redis';
import { InterviewSession } from '@ai-enhanced-web-apps/shared-types';
import { Calendar, Briefcase, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function InterviewSidebar() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 hidden md:block">
        <p className="text-sm text-slate-500 dark:text-slate-400">Not authenticated</p>
      </aside>
    );
  }

  const sessionIds = await redis.smembers(`user:sessions:${userId}`);
  const sessions = await Promise.all(
    sessionIds.map(async (id): Promise<InterviewSession | null> => {
      const session = (await redis.hgetall(`session:${id}`)) as InterviewSession | null;
      return session ? { ...session, id } : null;
    })
  );
  const validSessions = sessions.filter((s): s is InterviewSession => s !== null);
  validSessions.sort((a, b) => b.createdAt - a.createdAt);

  return (
    <aside className="w-66 border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl p-5 overflow-y-auto hidden md:flex flex-col h-[calc(100vh-3.5rem)] shrink-0">
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">Interview History</h2>
      </div>
      
      <div className="space-y-3 flex-1">
        {validSessions.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-400 dark:text-slate-500">No interviews yet.</p>
          </div>
        ) : (
          validSessions.map((session) => (
            <Link
              key={session.id}
              href={`/chat/${session.id}`}
              className="group block p-3.5 rounded-xl bg-white/60 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start gap-2.5">
                <Briefcase className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 group-hover:text-blue-500 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {session.jobType}
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>{new Date(Number(session.createdAt)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {session.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">
                      {session.questionType}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}


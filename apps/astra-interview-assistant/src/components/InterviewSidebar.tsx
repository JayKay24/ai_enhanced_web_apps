import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Redis } from '@upstash/redis';
import { InterviewSession } from '@ai-enhanced-web-apps/shared-types';

export const dynamic = 'force-dynamic';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function InterviewSidebar() {
  const { userId } = await auth();

  if (!userId) {
    return <p className="p-4 text-sm text-gray-500">Not authenticated</p>;
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
    <aside className="w-64 border-r p-4 overflow-y-auto hidden md:block">
      <h2 className="text-lg font-semibold mb-4">Interview History</h2>
      <div className="space-y-2">
        {validSessions.length === 0 ? (
          <p className="text-sm text-gray-500">No interviews yet.</p>
        ) : (
          validSessions.map((session) => (
            <Link
              key={session.id}
              href={`/chat/${session.id}`}
              className="block p-3 rounded-lg hover:bg-accent transition-colors border"
            >
              <div className="text-sm font-medium truncate">{session.jobType}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(Number(session.createdAt)).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {session.difficulty} · {session.questionType}
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}

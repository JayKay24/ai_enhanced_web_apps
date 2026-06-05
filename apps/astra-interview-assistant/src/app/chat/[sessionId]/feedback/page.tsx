import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSession, generateFeedback } from '../../../../services/interview-service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ai-enhanced-web-apps/chat-ui';
import Markdown from '../../../../components/Markdown';

export const dynamic = 'force-dynamic';

interface FeedbackPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { sessionId } = await params;

  const { userId } = await auth();
  if (!userId) {
    return notFound();
  }

  try {
    const { session, feedback } = await getSession(userId, sessionId);

    let activeFeedback = feedback;
    if (!activeFeedback) {
      const generated = await generateFeedback(userId, sessionId);
      activeFeedback = generated.feedback;
    }

    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Interview Feedback</CardTitle>
            <CardDescription>
              Here's a comprehensive feedback analysis for your interview session ({session.jobType} - {session.difficulty}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose lg:prose-lg max-w-none">
              <Markdown text={activeFeedback} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Feedback page loading error:', error);
    return notFound();
  }
}

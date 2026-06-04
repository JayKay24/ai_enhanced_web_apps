'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ai-enhanced-web-apps/chat-ui';
import { Input } from '../../components/ui/input';
import { createInterviewSession } from '@ai-enhanced-web-apps/shared-utils';

export default function ChatConfigurator() {
  const router = useRouter();
  const [jobType, setJobType] = useState('Frontend Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('Technical');
  const [questionCount, setQuestionCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  
  const startInterview = async () => {
    setIsLoading(true);
    const { sessionId } = await createInterviewSession({ jobType, difficulty, questionType, questionCount });
    router.push(`/chat/${sessionId}`);
  };

  return (
    <div className="p-8 max-w-lg mx-auto mt-10 border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Configure Interview</h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Job Type</label>
          <Input className="mt-1" value={jobType} onChange={e => setJobType(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Difficulty</label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
            value={difficulty} 
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Difficult">Difficult</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Question Type</label>
          <Input className="mt-1" value={questionType} onChange={e => setQuestionType(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Question Count</label>
          <Input className="mt-1" type="number" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} />
        </div>
        <Button className="w-full mt-4" onClick={startInterview} disabled={isLoading}>
          {isLoading ? 'Starting...' : 'Start Interview'}
        </Button>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ai-enhanced-web-apps/chat-ui';
import { Input } from '../../components/ui/input';

export default function ChatConfigurator() {
  const router = useRouter();
  const [jobType, setJobType] = useState('Frontend Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('Technical');
  const [questionCount, setQuestionCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  
  const startInterview = async () => {
    setIsLoading(true);
    const res = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        interviewConfig: { jobType, difficulty, questionType, questionCount }
      })
    });
    const { sessionId } = await res.json();
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
          <Input className="mt-1" value={difficulty} onChange={e => setDifficulty(e.target.value)} />
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

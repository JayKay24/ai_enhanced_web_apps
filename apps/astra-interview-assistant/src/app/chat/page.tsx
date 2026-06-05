'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@ai-enhanced-web-apps/chat-ui';
import { createInterviewSession } from '@ai-enhanced-web-apps/shared-utils';
import { Briefcase, Sliders, Play, Settings } from 'lucide-react';

export default function ChatConfigurator() {
  const router = useRouter();
  const [jobType, setJobType] = useState('Frontend Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('Technical');
  const [questionCount, setQuestionCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  
  const startInterview = async () => {
    setIsLoading(true);
    try {
      const { sessionId } = await createInterviewSession({ jobType, difficulty, questionType, questionCount });
      router.push(`/chat/${sessionId}`);
    } catch (error) {
      console.error('Error starting interview:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/30 dark:bg-slate-900/10 min-h-[calc(100vh-3.5rem)]">
      <Card className="w-full max-w-lg shadow-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="space-y-1.5 pb-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Configure Interview</CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-slate-500">Customize the interview assistant settings to begin your session.</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase size={15} className="text-slate-400" />
              <span>Job Type</span>
            </label>
            <Input 
              className="bg-transparent dark:text-white" 
              value={jobType} 
              onChange={e => setJobType(e.target.value)} 
              placeholder="e.g. Frontend Engineer, Product Manager"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Difficulty</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:text-white dark:bg-slate-950"
                value={difficulty} 
                onChange={e => setDifficulty(e.target.value)}
              >
                <option value="Easy" className="dark:bg-slate-950">Easy</option>
                <option value="Medium" className="dark:bg-slate-950">Medium</option>
                <option value="Difficult" className="dark:bg-slate-950">Difficult</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Question Count</label>
              <Input 
                type="number" 
                className="bg-transparent dark:text-white"
                value={questionCount} 
                min={1}
                max={10}
                onChange={e => setQuestionCount(Number(e.target.value))} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders size={15} className="text-slate-400" />
              <span>Question Type</span>
            </label>
            <Input 
              className="bg-transparent dark:text-white" 
              value={questionType} 
              onChange={e => setQuestionType(e.target.value)} 
              placeholder="e.g. Technical, Behavioral"
            />
          </div>
        </CardContent>
        
        <CardFooter className="pb-6 pt-2">
          <Button 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all duration-200" 
            onClick={startInterview} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Starting Session...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Start Interview</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

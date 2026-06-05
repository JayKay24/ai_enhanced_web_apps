'use client';

import * as React from 'react';
import { Card } from '@ai-enhanced-web-apps/chat-ui';
import { cn } from '@ai-enhanced-web-apps/shared-utils';
import Markdown from '../Markdown';

interface ChatBubbleProps {
  role: string;
  text: string;
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, className }) => {
  const isUser = role === 'user';
  
  return (
    <Card 
      className={cn(
        "p-5 flex flex-col gap-2.5 text-wrap break-words border-none shadow-sm max-w-[85%] sm:max-w-[75%]",
        isUser 
          ? "ml-auto bg-blue-600 text-white" 
          : "mr-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/60",
        className
      )}
    >
      <h5 className={cn(
        "text-xs font-semibold uppercase tracking-wider",
        isUser ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
      )}>
        {role === 'assistant' ? '✴️ Astra (Interviewer)' : '👤 You'}
      </h5>
      
      <div className={cn(
        "text-sm sm:text-base leading-relaxed whitespace-normal",
        isUser ? "prose prose-invert prose-sm" : "prose dark:prose-invert prose-sm"
      )}>
        <Markdown text={text} />
      </div>
    </Card>
  );
};

export default ChatBubble;

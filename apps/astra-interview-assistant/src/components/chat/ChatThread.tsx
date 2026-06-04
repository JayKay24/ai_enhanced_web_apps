'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@ai-enhanced-web-apps/chat-ui';
import { Input } from '../ui/input';
import ChatBubble from './ChatBubble';
import { AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { useInterviewChat } from '@ai-enhanced-web-apps/chat-hooks';
import { UIMessage } from 'ai';

export default function ChatThread({ sessionId, initialMessages = [], isCompleted = false }: any) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLoading,
    isAudioMuted,
    toggleAudio,
    playTTS
  } = useInterviewChat(sessionId, initialMessages);

  const [completed, setCompleted] = useState(isCompleted);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || completed) return;
    handleChatSubmit(e);
  };

  const handleCompleteSession = async () => {
    if (isLoading || messages.length === 0) return;
    try {
      await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', sessionId }),
      });
      setCompleted(true);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  return (
    <div className="flex flex-col h-[60vh]">
      {completed && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <p className="font-medium">This interview session has been completed</p>
          </div>
          <p className="mt-1">The interview is now locked and cannot be modified.</p>
        </div>
      )}

      <div className="flex justify-end mb-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleAudio}
          className={`flex items-center gap-1 ${!isAudioMuted ? 'text-blue-600' : 'text-gray-500'}`}
          disabled={completed}
        >
          {!isAudioMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="text-xs">{!isAudioMuted ? 'Voice On' : 'Voice Off'}</span>
        </Button>
      </div>

      <div className={`flex-1 overflow-y-auto p-2 ${completed ? 'opacity-80' : ''}`}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Your interview will begin when you send your first message
          </div>
        ) : (
          <div className="space-y-4">
            {messages.filter((m: UIMessage) => m.role !== 'system').map((message: UIMessage) => (
              <div key={message.id}>
                <ChatBubble
                  role={message.role}
                  text={message.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") || ""}
                  
                />
                {message.role === 'assistant' && !isAudioMuted && (
                  <div className="flex justify-start ml-2 mt-1">
                    <button
                      onClick={() => playTTS(message.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") || "")}
                      className="text-xs text-gray-500 hover:text-blue-500 flex items-center"
                      disabled={completed}
                    >
                      <Volume2 size={14} className="mr-1" />
                      Play
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="border-t mt-4 pt-4">
        {completed ? (
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <AlertCircle className="text-yellow-500 mr-2" size={18} />
            <span className="text-gray-700 font-medium">
              This interview session has been completed and cannot be modified
            </span>
            &nbsp;
            <Link href={`/chat/${sessionId}/feedback`}>
              <b>View Feedback</b>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your response..."
              disabled={isLoading || completed}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim() || completed}>
              Send
            </Button>
            <Button
              type="button"
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              onClick={handleCompleteSession}
              disabled={isLoading || messages.length === 0}
            >
              Complete Interview
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

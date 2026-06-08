'use client';
import * as React from 'react';
import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button, Input, AutoScroll, AutoScrollHandle, SessionCompletedBanner } from '@ai-enhanced-web-apps/chat-ui';
import ChatBubble from './ChatBubble';
import { Volume2, VolumeX, Send, CheckCircle, ChevronUp } from 'lucide-react';
import { useInterviewChat } from '@ai-enhanced-web-apps/chat-hooks';
import { UIMessage } from 'ai';
import { completeInterviewSession } from '@ai-enhanced-web-apps/shared-utils';
import { Message, TextPart } from '@ai-enhanced-web-apps/shared-types';

interface ChatThreadProps {
  sessionId: string;
  initialMessages?: Message[];
  isCompleted?: boolean;
}

const ChatThread: React.FC<ChatThreadProps> = ({ 
  sessionId, 
  initialMessages = [], 
  isCompleted = false 
}) => {
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
  const autoScrollRef = useRef<AutoScrollHandle>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || completed) return;
    handleChatSubmit(e);
  };

  const handleCompleteSession = async () => {
    if (isLoading || messages.length === 0) return;
    try {
      await completeInterviewSession(sessionId);
      setCompleted(true);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const handleScrollToTop = useCallback(() => {
    autoScrollRef.current?.scrollToTop();
  }, []);

  const handleScrollPositionChange = useCallback(
    (position: { atTop: boolean }) => {
      setIsAtTop(position.atTop);
    },
    []
  );

  const handlePlayTTS = useCallback((text: string) => {
    playTTS(text);
  }, [playTTS]);

  const filteredMessages = messages.filter(
    (m: UIMessage) => 
      m.role !== 'system' && 
      (m as any).content !== 'Start the interview' && 
      !m.parts?.some(p => p.type === 'text' && (p as TextPart).text === 'Start the interview')
  );

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-8.5rem)] relative">
      {completed && (
        <SessionCompletedBanner
          title="This interview session has been completed"
          description="The interview is now locked and feedback has been generated."
        />
      )}

      {/* Main Messages List wrapping in AutoScroll */}
      <div className="flex-1 overflow-hidden px-4 relative min-h-0">
        <AutoScroll
          ref={autoScrollRef}
          onScrollPositionChange={handleScrollPositionChange}
        >
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-12">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-sm font-medium">Your interview will begin when you send your first message</p>
            </div>
          ) : (
            <div className="space-y-6 py-4 pb-28">
              {filteredMessages.map((message: UIMessage) => {
                const messageText = message.parts?.filter((p): p is TextPart => p.type === "text").map((p) => p.text).join("") || (message as any).content || "";
                return (
                  <div key={message.id} className="flex flex-col gap-1.5">
                    <ChatBubble
                      role={message.role}
                      text={messageText}
                    />
                    {message.role === 'assistant' && !isAudioMuted && (
                      <div className="flex justify-start ml-2 mt-0.5 relative z-10 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePlayTTS(messageText);
                          }}
                          className="text-xs cursor-pointer text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                          disabled={completed}
                          title="Listen to response"
                        >
                          <Volume2 size={13} className="pointer-events-none" />
                          <span className="pointer-events-none">Speak</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </AutoScroll>
      </div>

      {/* Floating Scroll to Top Button */}
      {!isAtTop && filteredMessages.length > 0 && (
        <Button
          onClick={handleScrollToTop}
          className="absolute bottom-28 right-8 p-3 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 z-40 shrink-0 transition-all duration-200"
          aria-label="Scroll to top of conversation"
          size="icon"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      {/* Floating Bottom Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 dark:from-slate-900/90 via-slate-50/90 to-transparent pt-10 shrink-0 z-30 pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {completed ? (
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md pointer-events-auto">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  Interview completed
                </span>
              </div>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
                <Link href={`/chat/${sessionId}/feedback`}>
                  View Feedback Analysis
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl transition-all focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-950 overflow-hidden pointer-events-auto">
              <div className="flex items-center gap-2 p-2 pl-4 pr-3">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your response..."
                  disabled={isLoading || completed}
                  className="flex-1 border-none focus-visible:ring-0 shadow-none py-3 px-1 text-base bg-transparent dark:text-white"
                  autoFocus
                  autoComplete="off"
                />
                
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleAudio}
                    className={`rounded-full h-9 w-9 shrink-0 ${!isAudioMuted ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    disabled={completed}
                    title={!isAudioMuted ? 'Mute voice responses' : 'Unmute voice responses'}
                  >
                    {!isAudioMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 text-xs font-semibold bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-900/50 hover:bg-yellow-100 dark:hover:bg-yellow-950/40"
                    onClick={handleCompleteSession}
                    disabled={isLoading || messages.length === 0}
                  >
                    Complete
                  </Button>

                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim() || completed}
                    size="icon"
                    className="h-9 w-9 rounded-full shrink-0"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatThread;

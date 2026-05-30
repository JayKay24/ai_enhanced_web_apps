'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  Textarea,
  AutoScroll,
  AutoScrollHandle,
  Button,
  ChatList,
  WelcomeHeader,
} from '@ai-enhanced-web-apps/chat-ui';
import {
  useEnterSubmit,
  useFocusOnSlashPress,
} from '@ai-enhanced-web-apps/chat-hooks';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ChevronUp, Send } from 'lucide-react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (error) => {
      console.error('Error in RAG submission:', error);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (
    e?: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const value = input.trim();
    setInput('');

    try {
      await sendMessage({ text: value });
    } catch (error) {
      console.error('Error in RAG submission:', error);
    }
  };

  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useFocusOnSlashPress<HTMLTextAreaElement>();

  const autoScrollRef = useRef<AutoScrollHandle>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  const handleScrollToTop = useCallback(() => {
    autoScrollRef.current?.scrollToTop();
  }, []);

  const handleScrollPositionChange = useCallback(
    (position: { atTop: boolean }) => {
      setIsAtTop(position.atTop);
    },
    []
  );

  const chatListMessages = messages.map((m) => {
    let content = '';
    if (m.parts && Array.isArray(m.parts)) {
      for (const part of m.parts) {
        if (part.type === 'text') {
          content += part.text;
        }
      }
    }
    return {
      id: m.id,
      role: m.role,
      content,
    };
  });

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-24 stretch h-screen relative px-4">
      <AutoScroll
        ref={autoScrollRef}
        onScrollPositionChange={handleScrollPositionChange}
      >
        {messages.length === 0 && (
          <WelcomeHeader
            emoji="✈️"
            emojiLabel="airplane"
            title="Astra"
            subtitle="Search and analyze NTSB aviation safety reports"
          />
        )}
        {messages.length > 0 && (
          <ChatList messages={chatListMessages} isLoading={isLoading} />
        )}
      </AutoScroll>

      <div className="fixed bottom-0 w-full max-w-4xl left-1/2 -translate-x-1/2 px-4 pb-12 bg-gradient-to-t from-white via-white/90 to-transparent">
        <form
          className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-blue-100 overflow-hidden"
          ref={formRef}
          aria-labelledby="chat-form-label"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-row items-end gap-2 p-2 pl-4 pr-3">
            <Textarea
              ref={inputRef}
              className="flex-1 min-h-[44px] max-h-[200px] border-none focus-visible:ring-0 shadow-none py-3 px-1 resize-none text-base"
              placeholder="Ask a question about aviation incident reports (e.g. Cessna, icing, engine failure)..."
              tabIndex={0}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              name="message"
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              disabled={isLoading}
            />

            <div className="pb-1.5">
              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-full"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>

      {!isAtTop && messages.length > 0 && (
        <Button
          onClick={handleScrollToTop}
          className="fixed top-32 right-8 p-3 rounded-full shadow-lg bg-blue-500 text-white hover:bg-blue-600 z-50"
          aria-label="Scroll to top of conversation"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

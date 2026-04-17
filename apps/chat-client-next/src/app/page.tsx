'use client';

import React, { useRef, useState, useCallback, ChangeEvent } from 'react';
import { 
  Textarea, 
  ChatList, 
  AutoScroll, 
  AutoScrollHandle,
  Button 
} from '@ai-enhanced-web-apps/chat-ui';
import { 
  useEnterSubmit, 
  useFocusOnSlashPress, 
  useChatFormSubmit 
} from '@ai-enhanced-web-apps/chat-hooks';
import { ChatResponse } from '@ai-enhanced-web-apps/shared-types';
import { fetchAssistantResponse } from '@ai-enhanced-web-apps/shared-utils';
import { ChevronUp } from 'lucide-react';

const getAssistantResponse = async (text: string): Promise<ChatResponse> => {
  return fetchAssistantResponse('/api/chat', text);
};

export default function ChatPage() {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useFocusOnSlashPress<HTMLTextAreaElement>();
  const { messages, isLoading, handleSubmit, inputValue, setInputValue } = useChatFormSubmit(getAssistantResponse);
  
  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const autoScrollRef = useRef<AutoScrollHandle>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  const handleScrollToTop = useCallback(() => {
    autoScrollRef.current?.scrollToTop();
  }, []);

  const handleScrollPositionChange = useCallback((position: { atTop: boolean }) => {
    setIsAtTop(position.atTop);
  }, []);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-24 stretch h-screen relative px-4">
      <AutoScroll ref={autoScrollRef} onScrollPositionChange={handleScrollPositionChange}>
        {messages.length === 0 && (
          <div className="mt-4 mb-16">
            <h1 className="text-6xl font-semibold leading-tight">
              Hello, I'm{" "}
              <span role="img" aria-label="eight-pointed star">
                ✴️
              </span>{" "}
              Astra
            </h1>
            <p className="text-6xl font-semibold text-gray-400">Ask me anything you want</p>
          </div>
        )}
        {messages.length > 0 && <ChatList messages={messages} isLoading={isLoading} />}
      </AutoScroll>
      <form
        className="stretch max-w-4xl flex flex-row"
        ref={formRef}
        aria-labelledby="chat-form-label"
        onSubmit={handleSubmit}
      >
        <Textarea
          ref={inputRef}
          className="fixed bottom-0 w-full max-w-4xl p-2 mb-8 border border-gray-300 rounded shadow-xl"
          placeholder="Type your message here..."
          tabIndex={0}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
        />
      </form>
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

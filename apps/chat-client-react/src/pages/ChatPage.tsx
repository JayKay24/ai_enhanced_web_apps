import React, { useRef, useState, useCallback, ChangeEvent } from 'react';
import { Textarea } from '../components/ui/textarea';
import ChatList from '../components/chat/ChatList';
import useEnterSubmit from '../hooks/use-enter-submit';
import AutoScroll, { AutoScrollHandle } from '../components/AutoScroll';
import useFocusOnSlashPress from '../hooks/use-focus-on-slash-press';
import useChatFormSubmit from '../hooks/use-chat-form-submit';
import { getAssistantResponse } from '../lib/getAssistantResponse';

import Button from '../components/ui/button';
import { ChevronUp } from 'lucide-react';

const ChatPage: React.FC = () => {
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
    <div className="flex flex-col w-full max-w-4xl mx-auto py-24 stretch h-screen relative">
      <AutoScroll ref={autoScrollRef} onScrollPositionChange={handleScrollPositionChange}>
        {messages.length === 0 && (
          <h1 className="text-6xl font-semibold leading-tight mt-4 mb-16">
            <div className="inline-block">
              Hello, I'm{" "}
              <span role="img" aria-label="eight-pointed star">
                ✴️
              </span>{" "}
              Astra
            </div>
            <br />
            <span className="text-gray-400">Ask me anything you want</span>
          </h1>
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
};

export default ChatPage;

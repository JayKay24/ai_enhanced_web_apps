'use client';

import React, { useRef, useState, useCallback } from 'react';
import { 
  Textarea, 
  ChatList, 
  AutoScroll, 
  AutoScrollHandle,
  Button,
  ModelSelector
} from '@ai-enhanced-web-apps/chat-ui';
import { 
  useEnterSubmit, 
  useFocusOnSlashPress 
} from '@ai-enhanced-web-apps/chat-hooks';
import { useChat } from '@ai-sdk/react';
import { ChevronUp } from 'lucide-react';
import { Message } from '@ai-enhanced-web-apps/shared-types';
import { SUPPORTED_PROVIDERS_CONFIG, ProviderId } from '@ai-enhanced-web-apps/shared-utils';

export default function ChatPage() {
  const [providerId, setProviderId] = useState<ProviderId>('vertex');
  const [modelId, setModelId] = useState<string>(SUPPORTED_PROVIDERS_CONFIG.vertex.models[0]);

  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useFocusOnSlashPress<HTMLTextAreaElement>();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            provider: providerId,
            model: modelId,
          },
        }
      );
      setInput('');
    }
  };

  const handleProviderChange = (id: ProviderId) => {
    setProviderId(id);
    setModelId(SUPPORTED_PROVIDERS_CONFIG[id].models[0]);
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  const mappedMessages: Message[] = messages.map(m => ({
    id: m.id,
    role: m.role,
    content: m.parts
      .map(p => (p.type === 'text' ? p.text : ''))
      .join(''),
  }));

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
        <ModelSelector 
          providerId={providerId}
          modelId={modelId}
          onProviderChange={handleProviderChange}
          onModelChange={setModelId}
          disabled={isLoading}
        />
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
        {messages.length > 0 && <ChatList messages={mappedMessages} isLoading={isLoading} />}
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
          value={input}
          onChange={handleInputChange}
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

'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  Textarea,
  ChatList,
  AutoScroll,
  AutoScrollHandle,
  Button,
  ModelSelector,
  FileUploader,
  FileAttachment,
} from '@ai-enhanced-web-apps/chat-ui';
import {
  useEnterSubmit,
  useFocusOnSlashPress,
} from '@ai-enhanced-web-apps/chat-hooks';
import { useChat } from '@ai-sdk/react';
import { ChevronUp, Send } from 'lucide-react';
import { Message } from '@ai-enhanced-web-apps/shared-types';
import {
  SUPPORTED_PROVIDERS_CONFIG,
  ProviderId,
} from '@ai-enhanced-web-apps/shared-utils';

export default function ChatPage() {
  const [providerId, setProviderId] = useState<ProviderId>('vertex');
  const [modelId, setModelId] = useState<string>(
    SUPPORTED_PROVIDERS_CONFIG.vertex.models[0],
  );
  const [files, setFiles] = useState<FileAttachment[]>([]);

  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');

  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useFocusOnSlashPress<HTMLTextAreaElement>();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (
    e?: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e?.preventDefault();
    if (input.trim() || files.length > 0) {
      sendMessage(
        {
          parts: [
            { type: 'text', text: input },
            ...files.map((file) => ({
              type: 'file' as const,
              url: file.data,
              mediaType: file.type,
              name: file.name,
            })),
          ],
        },
        {
          body: {
            provider: providerId,
            model: modelId,
          },
        },
      );
      setInput('');
      setFiles([]);
    }
  };

  const handleFileUpload = (newFiles: FileAttachment[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProviderChange = (id: ProviderId) => {
    setProviderId(id);
    setModelId(SUPPORTED_PROVIDERS_CONFIG[id].models[0]);
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  const mappedMessages: Message[] = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.parts.map((p) => (p.type === 'text' ? p.text : '')).join(''),
    attachments: m.parts
      .filter((p) => p.type === 'file')
      .map((p) => {
        const filePart = p as any;
        return {
          url: filePart.url,
          contentType: filePart.mediaType || 'image/png',
          name: filePart.name,
        };
      }),
  }));

  const autoScrollRef = useRef<AutoScrollHandle>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  const handleScrollToTop = useCallback(() => {
    autoScrollRef.current?.scrollToTop();
  }, []);

  const handleScrollPositionChange = useCallback(
    (position: { atTop: boolean }) => {
      setIsAtTop(position.atTop);
    },
    [],
  );

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-24 stretch h-screen relative px-4">
      <AutoScroll
        ref={autoScrollRef}
        onScrollPositionChange={handleScrollPositionChange}
      >
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
              Hello, I'm{' '}
              <span role="img" aria-label="eight-pointed star">
                ✴️
              </span>{' '}
              Astra
            </div>
            <br />
            <span className="text-gray-400">Ask me anything you want</span>
          </h1>
        )}
        {messages.length > 0 && (
          <ChatList messages={mappedMessages} isLoading={isLoading} />
        )}
      </AutoScroll>

      <div className="fixed bottom-0 w-full max-w-4xl left-1/2 -translate-x-1/2 px-4 pb-12 bg-gradient-to-t from-white via-white/90 to-transparent">
        <form
          className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-blue-100 overflow-hidden"
          ref={formRef}
          aria-labelledby="chat-form-label"
          onSubmit={handleSubmit}
        >
          {files.length > 0 && (
            <div className="p-3 border-b border-gray-100 bg-gray-50/30">
              <FileUploader
                files={files}
                onFileUpload={handleFileUpload}
                onRemoveFile={handleRemoveFile}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex flex-row items-end gap-2 p-2 pl-1 pr-3">
            <div className="pb-1">
              <FileUploader
                files={[]}
                onFileUpload={handleFileUpload}
                onRemoveFile={handleRemoveFile}
                disabled={isLoading}
              />
            </div>

            <Textarea
              ref={inputRef}
              className="flex-1 min-h-[44px] max-h-[200px] border-none focus-visible:ring-0 shadow-none py-3 px-1 resize-none text-base"
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

            <div className="pb-1.5">
              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-full"
                disabled={isLoading || (!input.trim() && files.length === 0)}
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

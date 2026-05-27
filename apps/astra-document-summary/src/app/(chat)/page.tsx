'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  Textarea,
  AutoScroll,
  AutoScrollHandle,
  Button,
  ChatMessage,
  ChatList,
  WelcomeHeader,
} from '@ai-enhanced-web-apps/chat-ui';
import {
  useEnterSubmit,
  useFocusOnSlashPress,
} from '@ai-enhanced-web-apps/chat-hooks';
import { useActions, useUIState } from '@ai-sdk/rsc';
import { ChevronUp, Send, Paperclip, X, FileText } from 'lucide-react';
import { generateUniqueId, MAX_FILE_SIZE_BYTES, FILE_SIZE_ERROR_MESSAGE } from '@ai-enhanced-web-apps/shared-utils';
import { AI } from './actions';

export default function ChatPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useUIState<typeof AI>();
  const { continueConversation } = useActions<typeof AI>() as any;
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');

  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useFocusOnSlashPress<HTMLTextAreaElement>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(FILE_SIZE_ERROR_MESSAGE);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setSelectedFile(file);
      setInput(''); // Clear text when file is selected
    } else {
      alert('Please upload only PDF or DOCX files');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (
    e?: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e?.preventDefault();
    if (!selectedFile && !input.trim()) return;

    const value = input.trim();
    setInput('');
    setIsLoading(true);

    const userMessageText = selectedFile
      ? `Uploaded file: ${selectedFile.name}`
      : value;

    // Optimistic UI update
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: generateUniqueId(),
        display: (
          <ChatMessage
            role="user"
            text={userMessageText}
            className="ml-auto"
          />
        ),
      },
    ]);

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        setSelectedFile(null);
        response = await continueConversation(formData);
      } else {
        response = await continueConversation(value);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        response,
      ]);
    } catch (error) {
      console.error('Error in chat submission:', error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
        {messages.length === 0 && (
          <WelcomeHeader
            emoji="✴️"
            emojiLabel="eight-pointed star"
            title="Astra"
            subtitle="Upload a document or paste text to summarize"
          />
        )}
        {messages.length > 0 && (
          <ChatList messages={messages} isLoading={isLoading} />
        )}
      </AutoScroll>

      <div className="fixed bottom-0 w-full max-w-4xl left-1/2 -translate-x-1/2 px-4 pb-12 bg-gradient-to-t from-white via-white/90 to-transparent">
        <form
          className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-blue-100 overflow-hidden"
          ref={formRef}
          aria-labelledby="chat-form-label"
          onSubmit={handleSubmit}
        >
          {selectedFile && (
            <div className="p-3 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-medium truncate max-w-[240px]">{selectedFile.name}</span>
                <span className="text-gray-400 text-xs shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600 rounded-full shrink-0"
                onClick={() => setSelectedFile(null)}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-row items-end gap-2 p-2 pl-2 pr-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
              disabled={isLoading}
            />

            <div className="pb-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-gray-500 hover:text-gray-900 rounded-full"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                title="Upload PDF or DOCX"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </div>

            <Textarea
              ref={inputRef}
              className="flex-1 min-h-[44px] max-h-[200px] border-none focus-visible:ring-0 shadow-none py-3 px-1 resize-none text-base"
              placeholder={selectedFile ? `Selected file: ${selectedFile.name}` : "Paste your text here or upload a document..."}
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
              disabled={isLoading || !!selectedFile}
            />

            <div className="pb-1.5">
              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-full"
                disabled={isLoading || (!input.trim() && !selectedFile)}
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

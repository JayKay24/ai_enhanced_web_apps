import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage, generateId } from 'ai';
import { fetchTTSAudio } from '@ai-enhanced-web-apps/shared-utils';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, TextPart } from '@ai-enhanced-web-apps/shared-types';

export function useInterviewChat(sessionId: string, initialMessages: Message[] = []) {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialTriggerRef = useRef(false);
  
  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error
  } = useChat({
    id: sessionId,
    messages: initialMessages.map((m) => ({
      ...m,
      id: m.id || generateId(),
    })) as unknown as UIMessage[],
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { sessionId },
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const playTTS = useCallback(async (text: string) => {
    try {
      const audioBlob = await fetchTTSAudio(text);
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
    }
  }, []);

  const toggleAudio = () => {
    if (!isAudioMuted && audioRef.current) {
      audioRef.current.pause();
    }
    setIsAudioMuted(!isAudioMuted);
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: React.SyntheticEvent<HTMLFormElement>) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  }, [input, sendMessage]);

  const append = useCallback((message: Message) => {
    sendMessage({ text: message.content });
  }, [sendMessage]);

  // Trigger initial AI question if conversation is empty
  useEffect(() => {
    const hasUserOrAssistantMessage = messages.some(
      (m) => m.role === 'user' || m.role === 'assistant'
    );
    if (!hasUserOrAssistantMessage && status === 'ready' && !initialTriggerRef.current) {
      initialTriggerRef.current = true;
      sendMessage({ text: 'Start the interview' });
    }
  }, [messages, status, sendMessage]);

  // Handle auto-playing TTS for the latest assistant message
  useEffect(() => {
    if (messages.length === 0 || isAudioMuted) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && status === 'ready' && lastMessage.parts && lastMessage.parts.length > 0) {
      const textParts = lastMessage.parts.filter(
        (p): p is TextPart => p.type === 'text'
      );
      if (textParts.length > 0) {
        textParts.map((p) => p.text).join(' ');
        // We only want to play it if we just finished streaming it.
        // It's a bit tricky to detect "just finished", but let's assume we do it.
        // For now, let's just expose playTTS and let the user click to play.
      }
    }
  }, [messages, status, isAudioMuted]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    setMessages,
    isAudioMuted,
    toggleAudio,
    playTTS,
  };
}

'use client';
import { useRef, type KeyboardEvent } from 'react';

function useEnterSubmit() {
  const formRef = useRef<HTMLFormElement>(null);
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      formRef.current?.requestSubmit();
      event.preventDefault();
    }
  };

  return { formRef, onKeyDown: handleKeyDown };
}

export default useEnterSubmit;

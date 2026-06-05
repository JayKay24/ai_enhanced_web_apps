'use client';
import { useEffect, useRef } from 'react';

function useFocusOnSlashPress() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const handleSlashKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isInputElement(e.target as HTMLElement)) {
        inputRef.current?.focus();
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleSlashKeyDown);

    return () => document.removeEventListener('keydown', handleSlashKeyDown);
  }, []);

  // Helper function to check if element is an input or textarea
  function isInputElement(element: HTMLElement) {
    return ['INPUT', 'TEXTAREA'].includes(element.nodeName);
  }
  return inputRef;
}

export default useFocusOnSlashPress;

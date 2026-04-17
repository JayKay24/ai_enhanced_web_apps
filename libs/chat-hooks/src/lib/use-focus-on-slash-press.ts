"use client";
import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook that focuses a specific input or textarea element when the '/' key is pressed,
 * provided the user isn't already typing in an input field.
 * 
 * @template T The type of the element to focus. Defaults to HTMLTextAreaElement | HTMLInputElement.
 * @returns {RefObject<T | null>} A ref to be attached to the target input element.
 */
function useFocusOnSlashPress<T extends HTMLTextAreaElement | HTMLInputElement = HTMLTextAreaElement | HTMLInputElement>(): RefObject<T | null> {
  const inputRef = useRef<T>(null);

  useEffect(() => {
    const handleSlashKeyDown = (e: KeyboardEvent): void => {
      if (e.key === '/' && !isInputElement(e.target)) {
        // Prevent the '/' from being typed in the now-focused input if that's desired.
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleSlashKeyDown);

    return () => document.removeEventListener('keydown', handleSlashKeyDown);
  }, []);

  /**
   * Helper function to check if the focused element is an input or textarea.
   * @param target The event target to check.
   * @returns {boolean} True if the target is an input or textarea, false otherwise.
   */
  function isInputElement(target: EventTarget | null): boolean {
    if (target instanceof HTMLElement) {
      return ['INPUT', 'TEXTAREA'].includes(target.nodeName);
    }
    return false;
  }

  return inputRef;
}

export default useFocusOnSlashPress;

import { useRef, KeyboardEvent, RefObject } from 'react';

/**
 * Return type for the useEnterSubmit hook.
 */
export interface UseEnterSubmit {
  /** Reference to the form element to be submitted. */
  formRef: RefObject<HTMLFormElement | null>;
  /** Keyboard event handler to trigger form submission on Enter press. */
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

/**
 * Hook to handle form submission when the Enter key is pressed (without Shift).
 * Useful for chat interfaces where Enter sends the message.
 */
function useEnterSubmit(): UseEnterSubmit {
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef.current?.requestSubmit();
      event.preventDefault();
    }
  };

  return { formRef, onKeyDown: handleKeyDown };
}

export default useEnterSubmit;

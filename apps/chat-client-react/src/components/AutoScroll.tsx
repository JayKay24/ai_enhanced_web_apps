import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  ReactNode,
} from 'react';

/**
 * Props for the AutoScroll component.
 */
export interface AutoScrollProps {
  /** The content to be rendered within the scrollable container. */
  children?: ReactNode;
  /** Optional callback triggered when the scroll status (at bottom or not) changes. */
  onScrollStatusChange?: (atBottom: boolean) => void;
  /** Optional callback triggered when the scroll position changes. */
  onScrollPositionChange?: (position: { atTop: boolean; atBottom: boolean }) => void;
}

/**
 * Handle type for the AutoScroll component exposed via ref.
 */
export interface AutoScrollHandle {
  /** Imperatively scrolls the container to its top. */
  scrollToTop: () => void;
  /** Imperatively scrolls the container to its bottom. */
  scrollToBottom: () => void;
  /** Returns whether the current scroll position is at the top. */
  getIsAtTop: () => boolean;
  /** Returns the current scroll position status. */
  getIsAtBottom: () => boolean;
}

/**
 * A scrollable container component that provides auto-scrolling capabilities
 * and tracks if the user is at the bottom.
 * It exposes a `scrollToBottom` method via `ref`.
 */
const AutoScroll = forwardRef<AutoScrollHandle, AutoScrollProps>(
  ({ children, onScrollStatusChange, onScrollPositionChange }, ref) => {
    const scrollableRef = useRef<HTMLDivElement>(null);
    // State to track the user's scroll position within the container.
    const [isAtTop, setIsAtTop] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(true);

    // Expose scroll helpers to the parent component via ref.
    useImperativeHandle(ref, () => ({
      /**
       * Imperatively scrolls the container to its top.
       */
      scrollToTop: () => {
        if (scrollableRef.current) {
          scrollableRef.current.scrollTop = 0;
        }
      },
      /**
       * Imperatively scrolls the container to its bottom.
       */
      scrollToBottom: () => {
        if (scrollableRef.current) {
          scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
        }
      },
      /**
       * Returns the current `isAtTop` status.
       * @returns {boolean} True if the user is at the top, false otherwise.
       */
      getIsAtTop: () => isAtTop,
      /**
       * Returns the current `isAtBottom` status.
       * @returns {boolean} True if the user is at or near the bottom, false otherwise.
       */
      getIsAtBottom: () => isAtBottom,
    }), [isAtBottom, isAtTop]);

    /**
     * Handles scroll events to update the `isAtBottom` state.
     * Uses a small buffer (10px) to consider "near bottom" as "at bottom".
     */
    const handleScroll = useCallback(() => {
      if (scrollableRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current;
        const atTop = scrollTop <= 0;
        // Check if user is at or very near the bottom
        const atBottom = scrollHeight - scrollTop <= clientHeight + 10;
        if (atTop !== isAtTop) {
          setIsAtTop(atTop);
        }
        if (atBottom !== isAtBottom) {
          setIsAtBottom(atBottom);
        }
        if (atBottom !== isAtBottom && onScrollStatusChange) {
          onScrollStatusChange(atBottom);
        }
        if ((atTop !== isAtTop || atBottom !== isAtBottom) && onScrollPositionChange) {
          onScrollPositionChange({ atTop, atBottom });
        }
      }
    }, [isAtBottom, isAtTop, onScrollPositionChange, onScrollStatusChange]);

    // Attach and detach scroll event listener
    useEffect(() => {
      const scrollElement = scrollableRef.current;
      if (!scrollElement) return;

      scrollElement.addEventListener('scroll', handleScroll);
      // Perform an initial check on mount to set the correct state
      handleScroll();
      
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
      };
    }, [handleScroll]);

    // Effect to auto-scroll when children (messages) change, but only if the user was already at the bottom.
    // This prevents disrupting the user if they've scrolled up to read old messages.
    useEffect(() => {
      if (isAtBottom && scrollableRef.current) {
        scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
      }
    }, [children, isAtBottom]); // `children` here typically represents the messages list changing

    return (
      // The div itself needs to be scrollable
      <div
        ref={scrollableRef}
        className="overflow-y-auto flex-grow flex flex-col h-full" // Make it vertically scrollable and fill available height
        style={{ minHeight: '0' }} // Ensures it can shrink if content is small
      >
        {children}
      </div>
    );
  }
);

AutoScroll.displayName = 'AutoScroll';

export default AutoScroll;

"use client";
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  ReactNode,
  Ref,
} from 'react';

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
 * Props for the AutoScroll component.
 */
export interface AutoScrollProps {
  /** The content to be rendered within the scrollable container. */
  children?: ReactNode;
  /** Optional callback triggered when the scroll status (at bottom or not) changes. */
  onScrollStatusChange?: (atBottom: boolean) => void;
  /** Optional callback triggered when the scroll position changes. */
  onScrollPositionChange?: (position: { atTop: boolean; atBottom: boolean }) => void;
  /** Ref to expose imperatively methods to the parent. (React 19+) */
  ref?: Ref<AutoScrollHandle>;
}

/**
 * A scrollable container component that provides auto-scrolling capabilities
 * and tracks if the user is at the bottom.
 * It exposes a `scrollToBottom` method via `ref`.
 */
export default function AutoScroll({
  children,
  onScrollStatusChange,
  onScrollPositionChange,
  ref,
}: AutoScrollProps) {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useImperativeHandle(
    ref,
    () => ({
      scrollToTop: () => {
        if (scrollableRef.current) {
          scrollableRef.current.scrollTop = 0;
        }
      },
      scrollToBottom: () => {
        if (scrollableRef.current) {
          scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
        }
      },
      getIsAtTop: () => isAtTop,
      getIsAtBottom: () => isAtBottom,
    }),
    [isAtBottom, isAtTop]
  );

  /**
   * Handles scroll events to update the `isAtBottom` state.
   * Uses a small buffer (10px) to consider "near bottom" as "at bottom".
   */
  const handleScroll = useCallback(() => {
    if (scrollableRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current;
      const atTop = scrollTop <= 0;
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

  useEffect(() => {
    const scrollElement = scrollableRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (isAtBottom && scrollableRef.current) {
      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
    }
  }, [children, isAtBottom]);

  return (
    <div
      ref={scrollableRef}
      className="overflow-y-auto flex-grow flex flex-col h-full"
      style={{ minHeight: '0' }}
    >
      {children}
    </div>
  );
}

// The message list owns the scroll container so long responses stay inside one stable panel.
// Enhanced with smooth scroll behavior when new tokens arrive
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble.jsx";
import { TypingSkeleton } from "./TypingSkeleton.jsx";

export const ChatMessageList = ({
  messages,
  isStreaming,
  completedResponseCount = 0,
}) => {
  const containerRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const previousContentLengthRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const messageCountIncreased =
      messages.length > previousMessageCountRef.current;
    const lastMessage = messages[messages.length - 1];
    const contentUpdated =
      lastMessage &&
      lastMessage.content?.length !== previousContentLengthRef.current;

    // Update refs first
    previousMessageCountRef.current = messages.length;

    if (lastMessage) {
      previousContentLengthRef.current = lastMessage.content?.length || 0;
    } else {
      previousContentLengthRef.current = 0;
    }

    // Scroll to bottom immediately for all changes during streaming
    // This provides the best perceived responsiveness for streaming content
    if (messageCountIncreased || (isStreaming && contentUpdated)) {
      requestAnimationFrame(() => {
        try {
          // For streaming tokens, use immediate scroll for maximum responsiveness
          // The browser's smooth scroll would delay visual feedback
          if (container && (messageCountIncreased || isStreaming)) {
            container.scrollTop = container.scrollHeight;
          }
        } catch (error) {
          // Silently catch any scroll-related errors
        }
      });
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!completedResponseCount) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        } catch (error) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }, 80);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [completedResponseCount]);

  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator =
    isStreaming &&
    (!lastMessage || lastMessage.role !== "assistant" || !lastMessage.content);

  if (!messages.length && !isStreaming) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-[2rem] p-10 text-center">
        <div>
          <p className="text-xl font-semibold">✨ Ask anything</p>
          <p className="mt-3 max-w-md muted-text text-sm">
            Start a new conversation, switch to temporary mode, or load a saved
            chat from the sidebar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto pr-2 scroll-smooth"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="space-y-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {showTypingIndicator ? (
          <div className="px-4 py-3">
            <TypingSkeleton />
          </div>
        ) : null}
      </div>
    </div>
  );
};

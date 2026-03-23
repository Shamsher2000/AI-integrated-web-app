/**
 * ChatComposer - Message input component styled like ChatGPT/Gemini
 * - Auto-expanding textarea that grows with content
 * - Enter to send, Shift+Enter for new line
 * - Pinned to bottom of chat panel
 * - Streaming message support (Stop button during generation)
 * - Optimized for low input latency
 */
import { ArrowUp, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { useKeyboardSubmit } from "../../hooks/useKeyboardSubmit.js";

const CharacterCount = memo(({ length }) => (
  <span className="text-xs" style={{ color: 'var(--muted)' }}>
    {length}
    <span className="mx-1">/</span>
    6000
  </span>
));
CharacterCount.displayName = 'CharacterCount';

export const ChatComposer = ({
  value,
  onChange,
  onSubmit,
  onAbort,
  isStreaming,
  isOnline,
  temporaryMode,
  onToggleTemporary,
}) => {
  const textareaRef = useRef(null);
  const [isComposing, setIsComposing] = useState(false);
  const resizeTimerRef = useRef(null);

  const focusTextarea = useCallback(() => {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const handleSendClick = useCallback(() => {
    onSubmit();
    focusTextarea();
  }, [onSubmit, focusTextarea]);

  // Handle keyboard submission (Enter to send, Shift+Enter for newline)
  const handleKeyDown = useKeyboardSubmit(() => {
    if (value.trim() && !isStreaming && isOnline && !isComposing) {
      onSubmit();
    }
  });

  // Auto-expand textarea as content grows - optimized with debouncing
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Clear any pending resize
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current);
    }

    // Use a microtask for immediate resize without blocking input
    resizeTimerRef.current = setTimeout(() => {
      // Use requestAnimationFrame for smooth resize
      requestAnimationFrame(() => {
        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = newHeight + "px";
      });
    }, 0);

    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, [value]);

  // Determine if send button should be enabled
  const canSend = value.trim() && !isStreaming && isOnline && !isComposing;

  // Memoized event handlers to prevent unnecessary re-renders
  const handleContainerMouseEnter = useCallback((e) => {
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(11, 87, 212, 0.1)';
  }, []);

  const handleContainerMouseLeave = useCallback((e) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
  }, []);

  const handleSendButtonMouseEnter = useCallback((e) => {
    if (canSend) {
      e.currentTarget.style.backgroundColor = 'var(--accent-strong)';
    }
  }, [canSend]);

  const handleSendButtonMouseLeave = useCallback((e) => {
    if (canSend) {
      e.currentTarget.style.backgroundColor = 'var(--accent)';
    }
  }, [canSend]);

  const handleAbortButtonMouseEnter = useCallback((e) => {
    e.currentTarget.style.opacity = '0.8';
  }, []);

  const handleAbortButtonMouseLeave = useCallback((e) => {
    e.currentTarget.style.opacity = '1';
  }, []);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Info bar: temporary mode toggle + character count */}
      <div className="flex items-center justify-between px-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs transition-colors" style={{ color: 'var(--muted)' }}>
          <input
            type="checkbox"
            checked={temporaryMode}
            onChange={(event) => onToggleTemporary(event.target.checked)}
            className="cursor-pointer"
          />
          <span>Temporary mode</span>
        </label>
        <CharacterCount length={value.length} />
      </div>

      {/* Main input area - ChatGPT/Gemini style */}
      <div 
        className="flex items-end gap-3 rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md"
        style={{
          backgroundColor: 'var(--surface-strong)',
          borderColor: 'var(--border)',
        }}
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        {/* Textarea - grows with content */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="Message the assistant... (Shift + Enter for new line)"
          maxLength={6000}
          disabled={!isOnline}
          className="min-h-12 max-h-48 w-full resize-none bg-transparent outline-none"
          style={{
            color: 'var(--text)',
            caretColor: 'var(--accent)',
            willChange: 'height',
          }}
        />

        {/* Action button: Stop (when streaming) or Send */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onAbort}
            className="shrink-0 rounded-lg p-2 text-white transition-colors"
            style={{
              backgroundColor: 'var(--danger)',
            }}
            onMouseEnter={handleAbortButtonMouseEnter}
            onMouseLeave={handleAbortButtonMouseLeave}
            title="Stop generating"
          >
            <Square className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendClick}
            disabled={!canSend}
            className="shrink-0 rounded-lg p-2 transition-all"
            style={{
              backgroundColor: canSend ? 'var(--accent)' : 'var(--surface-soft)',
              color: canSend ? 'white' : 'var(--muted)',
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={handleSendButtonMouseEnter}
            onMouseLeave={handleSendButtonMouseLeave}
            title={canSend ? "Send message" : "Enter a message to send"}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-center text-xs text-gray-400">
        Chat messages are saved and synced across devices
      </p>
    </div>
  );
};

import { useCallback, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useChatStream } from './useChatStream.js'

const MAX_STREAM_HISTORY_MESSAGES = 30
const ALLOWED_HISTORY_ROLES = new Set(['user', 'assistant', 'system'])

/**
 * Hook to manage message submission and AI streaming
 * 
 * Core responsibilities:
 * - Optimistically add user and assistant messages to local state
 * - Stream AI response tokens with smart buffer flushing (10ms debounce)
 * - Reconcile client-side optimistic updates with final server responses
 * - Handle conversation history for both temporary and saved chats
 * - Manage error states and preserve partial streamed content
 * 
 * Architecture:
 * - Temporary chats: Client sends message history + user input
 * - Saved chats: Server loads full history from database using chatId
 * - Streaming: Uses token buffer with 10ms flush interval for smooth updates
 * 
 * Props:
 * - token: Auth token for API calls
 * - selectedChatId: Current saved chat ID (null for new chats)
 * - temporaryMode: Whether messages are not persisted
 * - onStatusMessage: Callback to update status/error messages
 * - onError: Callback for handling errors
 * - onChatCreated: Callback when a new chat is created on server
 */
export const useMessageHandler = ({ token, selectedChatId, temporaryMode, onStatusMessage, onError, onChatCreated }) => {
  const queryClient = useQueryClient()
  const { isStreaming, streamReply, abortStream } = useChatStream({ token })
  const [messages, setMessages] = useState([])
  const [completedResponseCount, setCompletedResponseCount] = useState(0)
  
  // Token batching refs - smooth streaming by collecting tokens before updating
  const tokenBufferRef = useRef('')
  const flushTimerRef = useRef(null)
  const assistantMessageIdRef = useRef(null)
  const hasRenderedFirstChunkRef = useRef(false)

  /**
   * Create a unique ID for messages (used for optimistic updates)
   */
  const generateMessageId = useCallback((role) => {
    return `${role}-${Date.now()}`
  }, [])

  /**
   * Update a specific message by ID
   */
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, ...updates } : message)),
    )
  }, [])

  /**
   * Add messages to the conversation
   */
  const addMessages = useCallback((newMessages) => {
    setMessages((current) => [...current, ...newMessages])
  }, [])

  /**
   * Keep stream payloads within server validation limits and strip invalid/empty entries.
   * Saved chats already load history from the database, so this matters most for temporary mode.
   */
  const sanitizeHistoryMessages = useCallback((historyMessages) => {
    return historyMessages
      .filter(
        (message) =>
          ALLOWED_HISTORY_ROLES.has(message?.role) &&
          typeof message?.content === 'string' &&
          message.content.trim(),
      )
      .slice(-MAX_STREAM_HISTORY_MESSAGES)
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }))
  }, [])

  /**
   * Preserve any partial streamed text and append the failure message for better UX.
   */
  const appendFailureToMessage = useCallback((messageId, errorMessage) => {
    const failureText = `Request failed: ${errorMessage}`

    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) {
          return message
        }

        const currentContent = message.content?.trim()
        return {
          ...message,
          content: currentContent
            ? `${currentContent}\n\n${failureText}`
            : failureText,
        }
      }),
    )
  }, [])

  /**
   * Flush buffered tokens to the message (called periodically during streaming)
   */
  const flushTokenBuffer = useCallback(() => {
    if (tokenBufferRef.current && assistantMessageIdRef.current) {
      const pendingTokens = tokenBufferRef.current

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageIdRef.current
            ? { ...message, content: `${message.content}${pendingTokens}` }
            : message,
        ),
      )
      tokenBufferRef.current = ''
    }
  }, [])

  /**
   * Flush immediately and clear any scheduled timer
   */
  const flushTokenBufferNow = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current)
      flushTimerRef.current = null
    }

    flushTokenBuffer()
  }, [flushTokenBuffer])

  /**
   * Submit a message and stream the AI response
   */
  const submitMessage = useCallback(
    async (userContent) => {
      // Validate input
      if (!userContent.trim() || isStreaming) {
        return
      }

      // Reset status message
      onStatusMessage?.('')

      // Store previous messages for context
      const previousMessages = messages

      // Create user message
      const userMessageId = generateMessageId('user')
      const userMessage = {
        id: userMessageId,
        role: 'user',
        content: userContent,
      }

      // Create placeholder for assistant message
      const assistantMessageId = generateMessageId('assistant')
      assistantMessageIdRef.current = assistantMessageId
      hasRenderedFirstChunkRef.current = false
      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      }

      // Add both messages to UI immediately (optimistic update)
      addMessages([userMessage, assistantMessage])

      // Stream AI response
      // Note: For saved chats, the server loads full history from DB using chatId
      // For temporary chats, we send the sanitized client-side history
      await streamReply({
        payload: {
          chatId: temporaryMode ? undefined : selectedChatId || undefined,
          content: userContent,
          temporary: temporaryMode,
          // CRITICAL: Saved chats send empty history - server loads from database.
          // Temporary chats send sanitized local history to stay within token limits.
          history: temporaryMode ? sanitizeHistoryMessages(previousMessages) : [],
        },
        // Render tokens immediately for smooth ChatGPT-like streaming
        // Minimal debouncing (10ms) to batch very rapid tokens without perceivable delay
        onToken: (tokenChunk) => {
          // Add token to buffer
          tokenBufferRef.current += tokenChunk

          // Always ensure message bubble is visible even with first token
          if (!hasRenderedFirstChunkRef.current) {
            hasRenderedFirstChunkRef.current = true
          }

          // Clear existing timer
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current)
          }

          // Use very short debounce (10ms) for nearly immediate rendering
          // This provides smooth token-by-token updates while minimizing re-renders
          flushTimerRef.current = setTimeout(() => {
            flushTimerRef.current = null
            flushTokenBuffer()
          }, 10)
        },
        // Handle successful completion
        onComplete: (result) => {
          const messageId = assistantMessageIdRef.current

          // Flush any remaining buffered tokens
          flushTokenBufferNow()

          // Reconcile the live message with the final server payload so no trailing text is lost.
          if (messageId && typeof result?.message?.content === 'string') {
            updateMessage(messageId, {
              content: result.message.content,
            })
          }

          setCompletedResponseCount((current) => current + 1)
          
          // Clear refs
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current)
            flushTimerRef.current = null
          }
          tokenBufferRef.current = ''
          assistantMessageIdRef.current = null
          hasRenderedFirstChunkRef.current = false
          
          // If a new chat was created on the first message, notify parent
          // This allows the parent to update selectedChatId so follow-up questions work correctly
          if (!temporaryMode && !selectedChatId && result.chat?.id) {
            onChatCreated?.(result.chat.id)
          }
          
          // Refresh chat queries to sync with server state
          if (!temporaryMode && result.chat?.id) {
            queryClient.invalidateQueries({ queryKey: ['chat', result.chat.id] })
            queryClient.invalidateQueries({ queryKey: ['chats'] })
          }
        },
        // Handle streaming errors
        onError: (error) => {
          // Flush any remaining buffered tokens before showing error
          flushTokenBufferNow()
          
          // Store the message ID before clearing refs
          const messageId = assistantMessageIdRef.current
          
          // Clear refs
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current)
            flushTimerRef.current = null
          }
          tokenBufferRef.current = ''
          assistantMessageIdRef.current = null
          hasRenderedFirstChunkRef.current = false
          
          // Update message with error
          if (messageId) {
            appendFailureToMessage(messageId, error.message)
          }
          onStatusMessage?.(error.message)
          onError?.(error)
        },
      })
    },
    [messages, isStreaming, temporaryMode, selectedChatId, generateMessageId, updateMessage, addMessages, sanitizeHistoryMessages, appendFailureToMessage, flushTokenBuffer, flushTokenBufferNow, streamReply, queryClient, onStatusMessage, onError, onChatCreated],
  )

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  /**
   * Set messages (useful when loading from server)
   */
  const setMessagesFromServer = useCallback((serverMessages) => {
    setMessages(serverMessages)
  }, [])

  return {
    messages,
    isStreaming,
    completedResponseCount,
    submitMessage,
    clearMessages,
    setMessagesFromServer,
    abortStream,
  }
}

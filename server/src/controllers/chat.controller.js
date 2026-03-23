/**
 * Chat Controller
 * Handles all HTTP endpoints for chat operations
 * - List chats with search
 * - Get chat details with messages
 * - Send messages and get AI replies
 * - Stream messages (Server-Sent Events)
 * - Clear/delete chat history
 */

import {
  clearChatMessages,
  createAssistantReply,
  deleteChatById,
  getChatDetail,
  listUserChats,
} from '../services/chat.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { initializeSse, sendSseEvent } from '../utils/sse.js'

/**
 * GET /chats
 * List all chats for the current user
 * - Supports pagination (page, limit)
 * - Supports search by title and content
 */
export const listChats = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.validated.query || {}

  const result = await listUserChats({
    userId: req.user._id,
    search,
    page,
    limit,
  })

  res.json({
    success: true,
    data: result,
  })
})

/**
 * GET /chats/:chatId
 * Get a specific chat with all its messages
 */
export const getChat = asyncHandler(async (req, res) => {
  const result = await getChatDetail({
    chatId: req.validated.params.chatId,
    userId: req.user._id,
  })

  res.json({
    success: true,
    data: result,
  })
})

/**
 * POST /chats/message
 * Send a message and get AI response (non-streaming)
 * Useful for simple requests or testing
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const result = await createAssistantReply({
    userId: req.user._id,
    ...req.validated.body,
  })

  res.status(201).json({
    success: true,
    data: result,
  })
})

/**
 * POST /chats/message/stream
 * Send a message and stream AI response (Server-Sent Events)
 * - Creates user message
 * - Calls AI provider with conversation history
 * - Streams response tokens in real-time
 * - Saves complete message when done
 */
export const streamMessage = asyncHandler(async (req, res) => {
  // Set up Server-Sent Events response
  initializeSse(res)

  // Allow client to abort the request
  const abortController = new AbortController()
  const handleClientDisconnect = () => {
    if (!res.writableEnded) {
      abortController.abort()
    }
  }

  req.on('aborted', handleClientDisconnect)
  res.on('close', handleClientDisconnect)

  try {
    // Signal that streaming has started
    sendSseEvent(res, 'status', { state: 'started' })

    // Create message and stream AI response
    const result = await createAssistantReply({
      userId: req.user._id,
      ...req.validated.body,
      stream: true,
      signal: abortController.signal,
      onToken: (token) => {
        // Send each token as it arrives from AI
        sendSseEvent(res, 'token', { token })
      },
    })

    // Send completion event with final data
    sendSseEvent(res, 'complete', result)
  } catch (error) {
    // Only send error if request wasn't aborted by client
    if (!abortController.signal.aborted) {
      sendSseEvent(res, 'error', {
        message: error.message || 'Streaming failed',
      })
    }
  } finally {
    req.off('aborted', handleClientDisconnect)
    res.off('close', handleClientDisconnect)

    // Ensure all data is flushed before closing connection
    if (!res.writableEnded && res.flush && typeof res.flush === 'function') {
      res.flush()
    }

    if (!res.writableEnded) {
      res.end()
    }
  }
})

/**
 * POST /chats/:chatId/clear
 * Delete all messages in a chat but keep the chat itself
 */
export const clearChat = asyncHandler(async (req, res) => {
  await clearChatMessages({
    chatId: req.validated.params.chatId,
    userId: req.user._id,
  })

  res.json({
    success: true,
    message: 'Chat cleared',
  })
})

/**
 * DELETE /chats/:chatId
 * Permanently delete a chat and all its messages
 */
export const deleteChat = asyncHandler(async (req, res) => {
  await deleteChatById({
    chatId: req.validated.params.chatId,
    userId: req.user._id,
  })

  res.json({
    success: true,
    message: 'Chat deleted',
  })
})

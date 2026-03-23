/**
 * Chat Service
 * Core business logic for chat operations
 * - Manages chat creation, retrieval, and deletion
 * - Handles conversation history
 * - Processes user messages and AI responses
 * - Supports both streaming and non-streaming modes
 */

import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { buildPromptMessages } from '../constants/assistantPrompt.js'
import { Chat } from '../models/Chat.js'
import { Message } from '../models/Message.js'
import { ApiError } from '../utils/ApiError.js'
import { deriveChatTitle, summarizeForSearch } from '../utils/chat.js'
import { createAiProvider } from './ai/providerFactory.js'

// ============================================
// HELPER FUNCTIONS - Used internally
// ============================================

/**
 * Verify that a chat belongs to the user
 * @throws {ApiError} If chat doesn't exist or user doesn't own it
 */
const assertChatOwnership = async (chatId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(404, 'Chat not found')
  }

  const chat = await Chat.findOne({ _id: chatId, owner: userId })
  if (!chat) {
    throw new ApiError(404, 'Chat not found')
  }

  return chat
}

/**
 * Load all messages for a chat (sorted by creation time)
 */
const loadChatMessages = async (chatId) =>
  Message.find({ chat: chatId }).sort({ createdAt: 1 }).lean()

/**
 * Create or retrieve a chat record
 * - For temporary mode: returns null (no storage)
 * - For existing chat: returns existing chat
 * - For new chat: creates new one with auto-generated title
 */
const prepareChatRecord = async ({ chatId, userId, content, temporary }) => {
  // Temporary chats aren't saved
  if (temporary) {
    return null
  }

  // Use existing chat
  if (chatId) {
    return assertChatOwnership(chatId, userId)
  }

  // Create new chat with auto-generated title from first message
  return Chat.create({
    owner: userId,
    title: deriveChatTitle(content),
    searchText: summarizeForSearch(content),
    lastMessagePreview: '',
    lastMessageAt: new Date(),
  })
}

/**
 * Build conversation history for AI prompt
 * - For temporary mode: uses provided history only
 * - For saved chat: loads from database
 * - Limits to max chat history to keep tokens reasonable
 */
const buildConversationHistory = async ({ chatId, userId, history, temporary }) => {
  // Use provided history for temporary chats
  if (temporary) {
    return history.slice(-env.maxChatHistory)
  }

  // Load history from database for saved chats
  const chat = await assertChatOwnership(chatId, userId)
  const messages = await Message.find({ chat: chat._id })
    .sort({ createdAt: 1 })
    .select('role content')
    .lean()

  // Return formatted messages, limited to max history
  return messages.slice(-env.maxChatHistory).map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

/**
 * Save AI response and update chat metadata
 */
const persistAssistantReply = async ({
  chat,
  assistantContent,
  providerName,
}) => {
  // Create message record
  await Message.create({
    chat: chat._id,
    owner: chat.owner,
    role: 'assistant',
    content: assistantContent,
    provider: providerName,
  })

  // Update chat metadata for quick access
  chat.lastMessageAt = new Date()
  chat.lastMessagePreview = assistantContent.slice(0, 280)
  chat.searchText = summarizeForSearch(`${chat.searchText} ${assistantContent}`)
  chat.messageCount += 1
  await chat.save()
}

/**
 * Build a helpful persisted failure message when the AI cannot complete the reply.
 * Preserves any partial streamed text when available.
 */
const buildAssistantFailureContent = ({ assistantContent, error }) => {
  const errorMessage =
    error?.message?.toString().trim() ||
    'AI service is temporarily unavailable. Please try again.'
  const partialContent = assistantContent.trim()

  return partialContent
    ? `${partialContent}\n\nRequest failed: ${errorMessage}`
    : `Request failed: ${errorMessage}`
}

// ============================================
// PUBLIC API - Exported functions
// ============================================

/**
 * List all chats for a user
 * - Filters by search query (title + content)
 * - Supports pagination
 * - Sorted by most recent first
 */
export const listUserChats = async ({
  userId,
  search = '',
  page = 1,
  limit = 20,
}) => {
  // Build search filter
  const filter = { owner: userId }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { searchText: { $regex: search, $options: 'i' } },
    ]
  }

  // Fetch chats and total count in parallel
  const [items, total] = await Promise.all([
    Chat.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Chat.countDocuments(filter),
  ])

  // Format response
  return {
    items: items.map((chat) => ({
      id: chat._id.toString(),
      title: chat.title,
      lastMessagePreview: chat.lastMessagePreview,
      lastMessageAt: chat.lastMessageAt,
      messageCount: chat.messageCount,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

/**
 * Get a specific chat with all its messages
 */
export const getChatDetail = async ({ chatId, userId }) => {
  const chat = await assertChatOwnership(chatId, userId)
  const messages = await Message.find({ chat: chat._id })
    .sort({ createdAt: 1 })
    .select('_id role content provider createdAt')
    .lean()

  return {
    chat: {
      id: chat._id.toString(),
      title: chat.title,
      lastMessagePreview: chat.lastMessagePreview,
      lastMessageAt: chat.lastMessageAt,
      messageCount: chat.messageCount,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    },
    messages: messages.map((message) => ({
      id: message._id.toString(),
      role: message.role,
      content: message.content,
      provider: message.provider,
      createdAt: message.createdAt,
    })),
  }
}

/**
 * Permanently delete a chat and all its messages
 */
export const deleteChatById = async ({ chatId, userId }) => {
  const chat = await assertChatOwnership(chatId, userId)
  
  // Delete messages and chat in parallel
  await Promise.all([
    Message.deleteMany({ chat: chat._id }),
    Chat.deleteOne({ _id: chat._id }),
  ])
}

/**
 * Clear all messages in a chat but keep the chat itself
 */
export const clearChatMessages = async ({ chatId, userId }) => {
  const chat = await assertChatOwnership(chatId, userId)
  
  // Remove messages
  await Message.deleteMany({ chat: chat._id })
  
  // Reset chat metadata
  chat.lastMessagePreview = ''
  chat.messageCount = 0
  chat.searchText = chat.title
  chat.lastMessageAt = new Date()
  await chat.save()
}

/**
 * Main function: Send user message and get AI response
 * - Saves user message (if not temporary)
 * - Calls AI provider with conversation history
 * - Saves AI response (if not temporary)
 * - Supports streaming (token-by-token) or regular response
 * @returns {Object} Chat info and assistant message
 */
export const createAssistantReply = async ({
  userId,
  chatId,
  content,
  history = [],
  temporary = false,
  stream = false,
  signal,
  onToken,
}) => {
  // Validate input
  const trimmedContent = content.trim()
  if (!trimmedContent) {
    throw new ApiError(400, 'Message content is required')
  }

  // Prepare or create chat record
  const chat = await prepareChatRecord({
    chatId,
    userId,
    content: trimmedContent,
    temporary,
  })

  // Build conversation history for AI
  const conversationHistory = await buildConversationHistory({
    chatId: chat?._id || chatId,
    userId,
    history,
    temporary,
  })

  // Format messages for AI provider
  const messages = buildPromptMessages({
    history: conversationHistory,
    userInput: trimmedContent,
  })

  // Save user message (if chat is saved)
  if (chat) {
    await Message.create({
      chat: chat._id,
      owner: userId,
      role: 'user',
      content: trimmedContent,
    })

    chat.lastMessageAt = new Date()
    chat.searchText = summarizeForSearch(`${chat.searchText} ${trimmedContent}`)
    chat.messageCount += 1
    await chat.save()
  }

  // Get AI response
  const aiProvider = createAiProvider()
  let assistantContent = ''

  try {
    // Stream or generate (collect all tokens)
    if (stream) {
      for await (const token of aiProvider.stream({ messages, signal })) {
        assistantContent += token
        onToken?.(token)
      }
    } else {
      assistantContent = await aiProvider.generate({ messages, signal })
    }
  } catch (error) {
    if (chat && !signal?.aborted) {
      await persistAssistantReply({
        chat,
        assistantContent: buildAssistantFailureContent({
          assistantContent,
          error,
        }),
        providerName: aiProvider.name,
      })
    }

    throw error
  }

  // Ensure we have some response
  const finalAssistantContent =
    assistantContent.trim() || 'I could not generate a response this time.'

  // Save assistant response (if chat is saved)
  if (chat) {
    await persistAssistantReply({
      chat,
      assistantContent: finalAssistantContent,
      providerName: aiProvider.name,
    })
  }

  // Return formatted response
  return {
    chat: chat
      ? {
          id: chat._id.toString(),
          title: chat.title,
        }
      : null,
    message: {
      role: 'assistant',
      content: finalAssistantContent,
      provider: aiProvider.name,
    },
  }
}

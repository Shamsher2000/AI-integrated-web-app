import Groq from 'groq-sdk'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'

const TRUNCATION_NOTICE =
  '\n\n[Response truncated because it reached the configured output token limit. Ask me to continue.]'

// Helper function to detect and handle Groq API errors
const handleGroqError = (error, context = '') => {
  console.error('🔴 Groq API Error:', {
    message: error?.message,
    status: error?.status,
    code: error?.code,
    response: error?.response?.data || error?.response,
    error: error?.error,
    context,
  })

  const errorMessage = error?.message || ''
  const errorResponse = error?.response?.data?.error || error?.error || {}
  const errorParam = errorResponse?.param
  const errorCode = errorResponse?.code

  // Check for quota exceeded / rate limit errors
  if (
    errorMessage.includes('429') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('rate_limit') ||
    errorMessage.includes('RESOURCE_EXHAUSTED') ||
    errorMessage.includes('Too Many Requests')
  ) {
    return new ApiError(
      429,
      'API quota exceeded. Please try again later.',
    )
  }

  // Check for authentication errors
  if (
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('API key') ||
    errorCode === 'invalid_api_key'
  ) {
    return new ApiError(
      401,
      'Authentication failed. Please check your API key.',
    )
  }

  // Check for invalid request errors with more detail
  if (error?.status === 400 || errorCode === 'invalid_request_error') {
    let detailMsg = 'Invalid request.'
    
    if (errorParam === 'messages') {
      detailMsg = 'Message format is invalid. Check message content and roles.'
    } else if (errorParam === 'model') {
      detailMsg = `Invalid model: ${env.groqModel}. Check GROQ_MODEL in .env`
    } else if (errorParam === 'max_tokens') {
      detailMsg = 'Invalid token limit. Reduce GROQ_MAX_TOKENS in .env'
    }

    return new ApiError(400, detailMsg)
  }

  // Model not found or unavailable
  if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    return new ApiError(
      400,
      `Model not found: ${env.groqModel}. Check available models.`,
    )
  }

  // Default API error with actual message
  return new ApiError(
    error?.status || 500,
    error?.message || 'AI service is temporarily unavailable. Please try again later.',
  )
}

export const createGroqProvider = () => {
  if (!env.groqApiKey) {
    throw new ApiError(500, 'GROQ_API_KEY is not configured')
  }

  const groq = new Groq({
    apiKey: env.groqApiKey,
  })

  return {
    name: 'groq',

    async generate({ messages }) {
      try {
        // Validate messages
        if (!messages || messages.length === 0) {
          throw new ApiError(400, 'No messages provided')
        }

        const processedMessages = messages.map((msg) => {
          if (!msg.role) {
            throw new ApiError(400, 'Message missing role field')
          }
          if (!msg.content || typeof msg.content !== 'string') {
            throw new ApiError(400, `Message with role "${msg.role}" has invalid content (must be string)`)
          }
          const trimmedContent = msg.content.trim()
          if (!trimmedContent) {
            throw new ApiError(400, `Message with role "${msg.role}" is empty after trimming`)
          }
          return {
            role: msg.role,
            content: trimmedContent,
          }
        })

        console.log('📤 Groq Request:', {
          model: env.groqModel,
          messageCount: processedMessages.length,
          roles: processedMessages.map((m) => m.role),
          firstMessageContent: processedMessages[0]?.content?.substring(0, 50),
        })

        const response = await groq.chat.completions.create({
          model: env.groqModel,
          messages: processedMessages,
          temperature: 0.7,
          max_tokens: env.groqMaxTokens,
        })

        const content = response.choices[0]?.message?.content || ''
        const finishReason = response.choices[0]?.finish_reason

        return `${content.trim() || ''}${
          finishReason === 'length' ? TRUNCATION_NOTICE : ''
        }`
      } catch (error) {
        throw handleGroqError(error, 'generate()')
      }
    },

    async *stream({ messages, signal }) {
      try {
        // Validate messages
        if (!messages || messages.length === 0) {
          throw new ApiError(400, 'No messages provided')
        }

        const processedMessages = messages.map((msg) => {
          if (!msg.role) {
            throw new ApiError(400, 'Message missing role field')
          }
          if (!msg.content || typeof msg.content !== 'string') {
            throw new ApiError(400, `Message with role "${msg.role}" has invalid content (must be string)`)
          }
          const trimmedContent = msg.content.trim()
          if (!trimmedContent) {
            throw new ApiError(400, `Message with role "${msg.role}" is empty after trimming`)
          }
          return {
            role: msg.role,
            content: trimmedContent,
          }
        })

        console.log('📤 Groq Streaming Request:', {
          model: env.groqModel,
          messageCount: processedMessages.length,
          roles: processedMessages.map((m) => m.role),
          maxTokens: env.groqMaxTokens,
        })

        const stream = await groq.chat.completions.create({
          model: env.groqModel,
          messages: processedMessages,
          temperature: 0.7,
          max_tokens: env.groqMaxTokens,
          stream: true,
        })

        let finishReason = null

        for await (const chunk of stream) {
          if (signal?.aborted) {
            break
          }

          const choice = chunk.choices[0]
          const text = choice?.delta?.content

          if (choice?.finish_reason) {
            finishReason = choice.finish_reason
          }

          if (text) {
            yield text
          }
        }

        if (finishReason === 'length') {
          yield TRUNCATION_NOTICE
        }
      } catch (error) {
        if (error?.name === 'AbortError') {
          // Stream was cancelled by user
          return
        }
        throw handleGroqError(error, 'stream()')
      }
    },
  }
}

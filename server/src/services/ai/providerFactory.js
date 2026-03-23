import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'
import { createGroqProvider } from './groq.provider.js'
import { createOpenAiProvider } from './openai.provider.js'
import { createHuggingFaceProvider } from './huggingface.provider.js'

/**
 * Create AI Provider Factory
 * Supports multiple AI providers: Groq, OpenAI, and HuggingFace
 * 
 * Available providers:
 * - 'groq': High-speed LLM inference with low latency
 * - 'openai': OpenAI's GPT models (requires OPENAI_API_KEY)
 * - 'huggingface': HuggingFace's open-source and commercial models (requires HUGGINGFACE_API_KEY)
 * 
 * Set AI_PROVIDER environment variable to switch between providers.
 */
export const createAiProvider = () => {
  const provider = env.aiProvider.toLowerCase()

  switch (provider) {
    case 'groq':
      return createGroqProvider()
    
    case 'openai':
      return createOpenAiProvider()
    
    case 'huggingface':
      return createHuggingFaceProvider()
    
    default:
      throw new ApiError(
        500,
        `Unsupported AI provider: '${provider}'. Supported providers are: 'groq', 'openai', 'huggingface'`,
      )
  }
}

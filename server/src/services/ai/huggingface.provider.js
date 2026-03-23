import { InferenceClient } from '@huggingface/inference'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'

export const createHuggingFaceProvider = () => {
  if (!env.huggingFaceApiKey) {
    throw new ApiError(500, 'HUGGINGFACE_API_KEY is not configured')
  }

  const client = new InferenceClient(env.huggingFaceApiKey)

  return {
    name: 'huggingface',
    async generate({ messages }) {
      const response = await client.chatCompletion({
        model: env.huggingFaceModel,
        messages,
        max_tokens: env.huggingFaceMaxTokens,
      })

      return response?.choices?.[0]?.message?.content?.trim() || ''
    },
    async *stream({ messages, signal }) {
      const stream = client.chatCompletionStream(
        {
          model: env.huggingFaceModel,
          messages,
          max_tokens: env.huggingFaceMaxTokens,
        },
        {
          signal,
        },
      )

      for await (const chunk of stream) {
        const token = chunk?.choices?.[0]?.delta?.content
        if (token) {
          yield token
        }
      }
    },
  }
}

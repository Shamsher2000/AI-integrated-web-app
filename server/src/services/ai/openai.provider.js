import OpenAI from 'openai'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'

const toResponsePayload = (messages) => {
  const instructions = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n')

  const input = messages
    .filter((message) => message.role !== 'system')
    .map((message) => {
      const roleLabel = message.role === 'assistant' ? 'Assistant' : 'User'
      return `${roleLabel}:\n${message.content}`
    })
    .join('\n\n')

  return {
    instructions: instructions || undefined,
    input,
  }
}

export const createOpenAiProvider = () => {
  if (!env.openAiApiKey) {
    throw new ApiError(500, 'OPENAI_API_KEY is not configured')
  }

  const client = new OpenAI({
    apiKey: env.openAiApiKey,
  })

  return {
    name: 'openai',
    async generate({ messages, signal }) {
      const payload = toResponsePayload(messages)

      const response = await client.responses.create(
        {
          model: env.openAiModel,
          store: true,
          ...payload,
        },
        {
          signal,
        },
      )

      return response.output_text?.trim() || ''
    },
    async *stream({ messages, signal }) {
      const payload = toResponsePayload(messages)

      const stream = await client.responses.create(
        {
          model: env.openAiModel,
          store: true,
          stream: true,
          ...payload,
        },
        {
          signal,
        },
      )

      for await (const event of stream) {
        if (event.type === 'response.output_text.delta' && event.delta) {
          yield event.delta
        }
      }
    },
  }
}

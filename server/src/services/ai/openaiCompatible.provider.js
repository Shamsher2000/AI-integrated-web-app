import { ApiError } from '../../utils/ApiError.js'

const parseErrorResponse = async (response) => {
  try {
    const payload = await response.json()
    return payload?.error?.message || payload?.message || response.statusText
  } catch {
    return response.statusText
  }
}

export class OpenAiCompatibleProvider {
  constructor({ name, baseUrl, apiKey, model }) {
    this.name = name
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiKey = apiKey
    this.model = model
  }

  async generate({ messages, signal }) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.5,
      }),
      signal,
    })

    if (!response.ok) {
      throw new ApiError(response.status, await parseErrorResponse(response))
    }

    const payload = await response.json()
    return payload?.choices?.[0]?.message?.content?.trim() || ''
  }

  async *stream({ messages, signal }) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.5,
        stream: true,
      }),
      signal,
    })

    if (!response.ok) {
      throw new ApiError(response.status, await parseErrorResponse(response))
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new ApiError(500, 'AI provider did not return a stream')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const eventChunk of events) {
        const lines = eventChunk
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)

        for (const line of lines) {
          if (!line.startsWith('data:')) {
            continue
          }

          const data = line.replace(/^data:\s*/, '')
          if (data === '[DONE]') {
            return
          }

          const payload = JSON.parse(data)
          const token = payload?.choices?.[0]?.delta?.content
          if (token) {
            yield token
          }
        }
      }
    }
  }
}

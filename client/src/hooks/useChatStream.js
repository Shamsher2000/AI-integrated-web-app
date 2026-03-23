// Streaming stays local to the chat page so Redux only handles durable UI/auth state.
import { useCallback, useRef, useState } from 'react'
import { API_BASE_URL } from '../lib/api.js'

export const useChatStream = ({ token }) => {
  const controllerRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)

  const abortStream = useCallback(() => {
    controllerRef.current?.abort()
  }, [])

  const streamReply = useCallback(
    async ({ payload, onToken, onComplete, onError }) => {
      const controller = new AbortController()
      controllerRef.current = controller
      setIsStreaming(true)

      try {
        const response = await fetch(`${API_BASE_URL}/chats/message/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        if (!response.ok) {
          let errorMessage = 'Unable to start AI stream'

          try {
            const errorPayload = await response.clone().json()
            const fieldErrors = Object.values(
              errorPayload?.errors?.fieldErrors || {},
            )
              .flat()
              .filter(Boolean)

            errorMessage =
              fieldErrors[0] ||
              errorPayload?.errors?.formErrors?.[0] ||
              errorPayload?.details ||
              errorPayload?.message ||
              errorMessage
          } catch {
            const errorText = await response.text().catch(() => '')
            if (errorText) {
              errorMessage = errorText
            }
          }

          throw new Error(errorMessage)
        }

        if (!response.body) {
          throw new Error('AI stream did not return a response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        const dispatchSseEvent = (eventChunk) => {
          if (!eventChunk.trim()) {
            return
          }

          const lines = eventChunk
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n')

          let eventName = 'message'
          const dataLines = []

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.replace('event:', '').trim() || eventName
              continue
            }

            if (line.startsWith('data:')) {
              dataLines.push(line.replace(/^data:\s*/, ''))
            }
          }

          if (!dataLines.length) {
            return
          }

          const payloadData = JSON.parse(dataLines.join('\n'))

          if (eventName === 'token') {
            onToken?.(payloadData.token)
            return
          }

          if (eventName === 'complete') {
            onComplete?.(payloadData)
            return
          }

          if (eventName === 'error') {
            throw new Error(payloadData.message || 'Streaming failed')
          }
        }

        // The backend sends Server-Sent Events, so we rebuild complete events from streamed chunks.
        while (true) {
          const { done, value } = await reader.read()

          buffer += decoder.decode(value, { stream: !done })
          buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

          // Split by double newline (SSE event separator)
          const events = buffer.split('\n\n')

          // Keep the last incomplete event in buffer (might be completed in next iteration)
          buffer = events.pop() || ''

          for (const eventChunk of events) {
            dispatchSseEvent(eventChunk)
          }

          if (done) {
            if (buffer.trim()) {
              dispatchSseEvent(buffer)
            }
            break
          }
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        onError?.(error)
      } finally {
        setIsStreaming(false)
        controllerRef.current = null
      }
    },
    [token],
  )

  return {
    isStreaming,
    streamReply,
    abortStream,
  }
}

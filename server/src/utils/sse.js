/**
 * Initialize Server-Sent Events response
 * Sets proper headers for streaming responses
 */
export const initializeSse = (res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Content-Encoding', 'identity')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable proxy buffering
  res.setHeader('Transfer-Encoding', 'chunked') // Ensure chunked transfer
  res.flushHeaders?.()
}

/**
 * Send a single Server-Sent Event
 * Properly formats and flushes each event to prevent buffering
 */
export const sendSseEvent = (res, event, payload) => {
  // Write the event in SSE format
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
  
  // Flush immediately to ensure data is sent to client
  // This prevents buffering that can cause data loss on stream completion
  if (res.flush && typeof res.flush === 'function') {
    res.flush()
  }
}

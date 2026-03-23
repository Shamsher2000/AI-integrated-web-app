export const deriveChatTitle = (content) => {
  const cleaned = content.replace(/\s+/g, ' ').trim()
  if (!cleaned) {
    return 'New chat'
  }

  const truncated = cleaned.slice(0, 60)
  return truncated.length < cleaned.length ? `${truncated}...` : truncated
}

export const summarizeForSearch = (text = '', limit = 1500) =>
  text.replace(/\s+/g, ' ').trim().slice(0, limit)

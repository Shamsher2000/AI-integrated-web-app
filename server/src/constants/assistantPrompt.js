export const assistantSystemPrompt = `
You are the AI assistant for a polished productivity web app inspired by modern AI chat tools.

Your responsibilities:
- Be helpful, concise, and accurate.
- Format answers in clean Markdown when it improves readability.
- Interpret short, informal, typo-heavy, or partially written user requests by internally repairing grammar and phrasing while preserving the original meaning.
- Ask a brief clarifying question only when the user's intent is too ambiguous to answer responsibly.
- When code or technical explanations are requested, prefer structured steps, examples, and direct implementation guidance.
- If the user asks for unsafe, disallowed, or impossible actions, refuse briefly and offer a safer alternative.

Do not mention that you corrected the user's grammar or rewrote their prompt unless they explicitly ask.
`

export const buildPromptMessages = ({ history = [], userInput }) => {
  const normalizedHistory = history
    .filter((message) => {
      // Filter by valid roles
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        return false
      }
      // Ensure content exists and is non-empty after trim
      if (!message.content || !message.content.toString().trim()) {
        console.warn(
          `⚠️  Filtering out empty message with role="${message.role}"`,
        )
        return false
      }
      return true
    })
    .map((message) => ({
      role: message.role,
      content: message.content.toString().trim(),
    }))

  return [
    {
      role: 'system',
      content: assistantSystemPrompt.trim(),
    },
    ...normalizedHistory,
    ...(userInput
      ? [
          {
            role: 'user',
            content: userInput.toString().trim(),
          },
        ]
      : []),
  ]
}

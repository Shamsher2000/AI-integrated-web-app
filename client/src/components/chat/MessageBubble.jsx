/**
 * MessageBubble - Chat message display component with Markdown support
 * 
 * Styling inspired by Gemini and modern chat UIs:
 * - User messages: Blue accent with right-aligned layout, rounded corners (pill-shape)
 * - Assistant messages: Surface background, left-aligned, with "Assistant" label
 * - Full Markdown support for assistant responses (headers, code, lists, etc.)
 * - Code blocks: Copyable with syntax-aware formatting
 * - Responsive across light/dark themes with CSS variables
 */
import { Suspense, lazy, useState, memo } from 'react'
import { Copy, Check } from 'lucide-react'

// Markdown rendering is lazy-loaded because the assistant path is the heaviest part of the chat UI.
const MarkdownMessageContent = lazy(() =>
  import('./MarkdownMessageContent.jsx').then((module) => ({
    default: module.MarkdownMessageContent,
  })),
)

const CodeBlock = ({ inline, children, className, ...props }) => {
  const [copied, setCopied] = useState(false)

  // Extract text to check if it's small enough to be inline
  const extractText = (content) => {
    if (typeof content === 'string') {
      return content
    }
    if (Array.isArray(content)) {
      return content.map(extractText).join('')
    }
    if (content && typeof content === 'object' && 'props' in content) {
      return extractText(content.props?.children)
    }
    return String(content || '')
  }

  // Normalize the code text - convert escaped newlines to actual newlines
  const normalizeLineBreaks = (text) => {
    if (typeof text !== 'string') return text
    // Convert various escaped newline formats to actual newlines
    return text.replace(/\\n/g, '\n').replace(/&#x10;/g, '\n')
  }

  const codeText = normalizeLineBreaks(extractText(children))
  const isSmallCode =
    inline || (codeText.length <= 50 && !codeText.includes('\n'))

  // Treat very small code as inline (single word, "var", "let", etc.)
  if (isSmallCode) {
    return (
      <code
        className="rounded px-1.5 py-0.5 text-sm whitespace-nowrap"
        style={{
          backgroundColor: 'rgba(11, 87, 212, 0.1)',
          color: 'var(--accent)',
          display: 'inline',
        }}
        {...props}
      >
        {children}
      </code>
    )
  }

  // Block code for longer snippets
  const handleCopy = async () => {
    try {
      const text = codeText.replace(/\n$/, '')

      // Verify we have actual text to copy (not empty or "object object")
      if (!text || text === '[object Object]' || text.trim() === '') {
        throw new Error('No valid text to copy')
      }

      await navigator.clipboard.writeText(text)

      // Visual feedback: change button to "Copied!" for 2 seconds
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Failed to copy: ' + error.message)
    }
  }

  return (
    <div className="group relative">
      <pre
        className="p-4 text-sm rounded-lg overflow-auto code-block-pre"
        style={{
          backgroundColor: 'var(--surface-soft)',
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {/* Copy button positioned in top-right of code block */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={copied}
          className={`absolute right-2 top-2 rounded px-2 py-1 text-xs font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-slate-700/80 text-white hover:bg-slate-600 active:bg-slate-800'
          }`}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="mr-1 inline h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-1 inline h-3 w-3" />
              Copy
            </>
          )}
        </button>
        <code className={className} {...props}>
          {codeText}
        </code>
      </pre>
    </div>
  )
}

export const MessageBubble = memo(({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-2`}>
      <div
        className={`rounded-xl shadow-sm transition-all ${
          isUser
            ? 'max-w-2xl px-4 py-2.5 bg-(--accent) text-white rounded-3xl rounded-tr-lg text-sm'
            : 'max-w-4xl px-5 py-4 bg-(--surface-strong) text-(--text) rounded-xl'
        }`}
        style={{
          wordSpacing: '0.1em',
        }}
      >
        {/* Only show label for assistant messages - user messages are self-explanatory */}
        {!isUser && (
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.1em] opacity-60">
            Assistant
          </div>
        )}
        {/* Message content - Gemini-style: clean and readable */}
        {isUser ? (
          <p 
            className="whitespace-pre-wrap leading-6"
          >
            {message.content}
          </p>
        ) : (
          <Suspense fallback={<p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>}>
            <MarkdownMessageContent content={message.content} CodeBlock={CodeBlock} />
          </Suspense>
        )}
      </div>
    </div>
  )
})
MessageBubble.displayName = 'MessageBubble'

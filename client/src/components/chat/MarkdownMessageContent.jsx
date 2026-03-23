// This component is split into its own chunk because markdown parsing and syntax highlighting are expensive.
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

export const MarkdownMessageContent = ({ content, CodeBlock }) => (
  <div className="assistant-markdown prose prose-slate max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none prose-pre:p-0">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code: ({ inline, node, ...props }) => <CodeBlock inline={inline} {...props} />,
        table: ({ node, ...props }) => (
          <div className="assistant-table-wrap not-prose">
            <table className="assistant-table" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => <th className="assistant-table-head" {...props} />,
        td: ({ node, ...props }) => <td className="assistant-table-cell" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
)

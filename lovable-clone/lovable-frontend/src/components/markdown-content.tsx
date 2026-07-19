import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className ?? '')
          const code = String(children).replace(/\n$/, '')

          if (match) {
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{ borderRadius: '0.75rem', fontSize: '0.85rem' }}
              >
                {code}
              </SyntaxHighlighter>
            )
          }

          return (
            <code className="rounded bg-[var(--color-muted)] px-1.5 py-0.5" {...props}>
              {children}
            </code>
          )
        },
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

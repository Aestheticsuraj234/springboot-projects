import { useEffect, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCard } from '@/components/message-card'
import { MessageLoading } from '@/components/message-loading'
import { MarkdownContent } from '@/components/markdown-content'
import { streamChat } from '@/lib/api'
import { useMessages } from '@/hooks/use-api'
import type { Fragment } from '@/types/api'

interface ChatPanelProps {
  projectId: string
  activeFragment: Fragment | null
  onFragmentSelect: (fragment: Fragment) => void
  onPreviewReady?: () => void
}

export function ChatPanel({ projectId, activeFragment, onFragmentSelect, onPreviewReady }: ChatPanelProps) {
  const queryClient = useQueryClient()
  const { data: messages = [], isLoading } = useMessages(projectId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [prompt, setPrompt] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, streamingText, isStreaming])

  useEffect(() => {
    const latestFragment = [...messages]
      .reverse()
      .find((message) => message.role === 'ASSISTANT' && message.fragment)?.fragment

    if (latestFragment) {
      onPreviewReady?.()
    }
  }, [messages, onPreviewReady])

  async function handleSubmit() {
    const content = prompt.trim()
    if (!content || isStreaming) return

    setPrompt('')
    setError(null)
    setStreamingText('')
    setIsStreaming(true)

    try {
      await streamChat(
        projectId,
        content,
        (chunk) => setStreamingText((current) => current + chunk),
        async () => {
          setStreamingText('')
          setIsStreaming(false)
          await queryClient.invalidateQueries({ queryKey: ['messages', projectId] })
          onPreviewReady?.()
        },
        (message) => {
          setError(message)
          setStreamingText('')
          setIsStreaming(false)
        },
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stream response')
      setIsStreaming(false)
    }
  }

  const lastMessage = messages.at(-1)
  const showLoadingPlaceholder = isStreaming || (lastMessage?.role === 'USER' && isStreaming)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-[var(--color-muted-foreground)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading conversation...
          </div>
        )}

        {!isLoading && messages.length === 0 && !isStreaming && (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--color-muted-foreground)]">
            No messages yet. Describe the app you want to build.
          </div>
        )}

        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            activeFragmentId={activeFragment?.id ?? null}
            onFragmentClick={onFragmentSelect}
          />
        ))}

        {isStreaming && streamingText && (
          <div className="px-2 pb-4">
            <div className="pl-7">
              <MarkdownContent content={streamingText} />
            </div>
          </div>
        )}

        {showLoadingPlaceholder && !streamingText && <MessageLoading />}
        <div ref={bottomRef} />
      </div>

      <div className="relative border-t border-[var(--color-border)] p-3">
        <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-[var(--color-background)]" />
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the app you want to build..."
            rows={3}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void handleSubmit()
              }
            }}
          />
          <Button className="self-end" disabled={isStreaming || !prompt.trim()} onClick={() => void handleSubmit()}>
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

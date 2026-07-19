import { useMemo, useState } from 'react'
import { Loader2, Send, Sparkles, Save } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { MarkdownContent } from '@/components/markdown-content'
import { streamChat } from '@/lib/api'
import { extractFilesFromContent } from '@/lib/extract-files'
import { useCreateFragment, useMessages } from '@/hooks/use-api'
import type { Message } from '@/types/api'

interface ChatPanelProps {
  projectId: string
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const queryClient = useQueryClient()
  const { data: messages = [], isLoading } = useMessages(projectId)
  const createFragment = useCreateFragment(projectId)
  const [prompt, setPrompt] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayMessages = useMemo(() => messages, [messages])

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

  async function handleSaveFragment(message: Message) {
    const files = extractFilesFromContent(message.content)
    await createFragment.mutateAsync({
      messageId: message.id,
      sandboxUrl: `https://preview.local/${projectId}/${message.id}`,
      title: 'Generated App Preview',
      files,
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-300" />
          <p className="text-sm font-medium">AI Chat</p>
          <Badge>Streaming</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading conversation...
          </div>
        )}

        <div className="space-y-4">
          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl border px-4 py-3 ${
                message.role === 'USER'
                  ? 'border-[var(--color-border)] bg-[var(--color-card)]'
                  : message.type === 'ERROR'
                    ? 'border-red-900/50 bg-red-950/20'
                    : 'border-indigo-900/40 bg-[var(--color-accent)]/40'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge>{message.role}</Badge>
                {message.role === 'ASSISTANT' && !message.fragment && message.type === 'RESULT' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={createFragment.isPending}
                    onClick={() => void handleSaveFragment(message)}
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save preview
                  </Button>
                )}
                {message.fragment && <Badge>Preview saved</Badge>}
              </div>
              <MarkdownContent content={message.content} />
            </div>
          ))}

          {isStreaming && streamingText && (
            <div className="rounded-xl border border-indigo-900/40 bg-[var(--color-accent)]/40 px-4 py-3">
              <div className="mb-2">
                <Badge>ASSISTANT</Badge>
              </div>
              <MarkdownContent content={streamingText} />
            </div>
          )}

          {isStreaming && !streamingText && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-[var(--color-border)] p-4">
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

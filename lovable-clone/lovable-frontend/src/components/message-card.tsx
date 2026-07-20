import { Sparkles } from 'lucide-react'
import { MarkdownContent } from '@/components/markdown-content'
import { FragmentCard } from '@/components/fragment-card'
import type { Fragment, Message } from '@/types/api'
import { cn } from '@/lib/utils'

interface MessageCardProps {
  message: Message
  activeFragmentId: string | null
  onFragmentClick: (fragment: Fragment) => void
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-2 pb-4 pl-10">
      <div className="max-w-[85%] rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm">
        {content}
      </div>
    </div>
  )
}

function AssistantMessage({
  message,
  activeFragmentId,
  onFragmentClick,
}: {
  message: Message
  activeFragmentId: string | null
  onFragmentClick: (fragment: Fragment) => void
}) {
  const isError = message.type === 'ERROR'

  return (
    <div className={cn('group flex flex-col px-2 pb-4', isError && 'text-red-400')}>
      <div className="mb-2 flex items-center gap-2 pl-2">
        <Sparkles className="h-5 w-5 shrink-0 text-indigo-300" />
        <span className="text-xs text-[var(--color-muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100">
          {new Date(message.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="flex flex-col gap-y-4 pl-7">
        <MarkdownContent content={message.content} />
        {message.fragment && message.type === 'RESULT' && (
          <FragmentCard
            fragment={message.fragment}
            isActive={activeFragmentId === message.fragment.id}
            onClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  )
}

export function MessageCard({ message, activeFragmentId, onFragmentClick }: MessageCardProps) {
  if (message.role === 'USER') {
    return <UserMessage content={message.content} />
  }

  return (
    <AssistantMessage
      message={message}
      activeFragmentId={activeFragmentId}
      onFragmentClick={onFragmentClick}
    />
  )
}

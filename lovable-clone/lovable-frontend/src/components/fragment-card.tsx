import { ChevronRight, Code2 } from 'lucide-react'
import type { Fragment } from '@/types/api'
import { cn } from '@/lib/utils'

interface FragmentCardProps {
  fragment: Fragment
  isActive: boolean
  onClick: (fragment: Fragment) => void
}

export function FragmentCard({ fragment, isActive, onClick }: FragmentCardProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-fit items-start gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-2 text-start transition-colors hover:bg-[var(--color-card)]',
        isActive && 'border-indigo-500 bg-[var(--color-accent)] text-indigo-100 hover:bg-[var(--color-accent)]',
      )}
      onClick={() => onClick(fragment)}
    >
      <Code2 className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex flex-1 flex-col">
        <span className="line-clamp-1 text-sm font-medium">{fragment.title}</span>
        <span className="text-xs opacity-80">Preview</span>
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
    </button>
  )
}

import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] placeholder:text-[var(--color-muted-foreground)] focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}

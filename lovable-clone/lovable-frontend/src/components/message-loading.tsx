import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const loadingMessages = [
  'Thinking...',
  'Generating...',
  'Processing your prompt...',
  'Building your app...',
  'Adding final touches...',
  'Almost there...',
]

function ShimmerMessages() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % loadingMessages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return <span className="animate-pulse text-sm text-[var(--color-muted-foreground)]">{loadingMessages[index]}</span>
}

export function MessageLoading() {
  return (
    <div className="group flex flex-col px-2 pb-4">
      <div className="mb-2 flex items-center gap-2 pl-2">
        <Sparkles className="h-5 w-5 shrink-0 text-indigo-300" />
      </div>
      <div className="flex flex-col gap-y-4 pl-7">
        <ShimmerMessages />
      </div>
    </div>
  )
}

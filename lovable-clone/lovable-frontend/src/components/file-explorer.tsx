import { FileCode2, Folder } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Fragment } from '@/types/api'

interface FileExplorerProps {
  fragment: Fragment | null
  selectedFile: string | null
  onSelectFile: (path: string) => void
}

export function FileExplorer({ fragment, selectedFile, onSelectFile }: FileExplorerProps) {
  const files = fragment ? Object.keys(fragment.files ?? {}).sort() : []

  return (
    <div className="flex h-full flex-col border-r border-[var(--color-border)] bg-[#0f0f12]">
      <div className="border-b border-[var(--color-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Files
      </div>
      <ScrollArea className="flex-1 p-2">
        {!fragment && (
          <p className="px-2 py-3 text-xs text-[var(--color-muted-foreground)]">
            No generated files yet.
          </p>
        )}
        {files.map((path) => (
          <button
            key={path}
            type="button"
            onClick={() => onSelectFile(path)}
            className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${
              selectedFile === path
                ? 'bg-[var(--color-accent)] text-indigo-100'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]'
            }`}
          >
            {path.includes('/') ? <Folder className="h-3.5 w-3.5" /> : <FileCode2 className="h-3.5 w-3.5" />}
            <span className="truncate">{path}</span>
          </button>
        ))}
      </ScrollArea>
    </div>
  )
}

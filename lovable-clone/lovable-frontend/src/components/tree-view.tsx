import { ChevronRight, FileCode2, Folder, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import type { TreeItem } from '@/lib/file-tree'
import { cn } from '@/lib/utils'

interface TreeViewProps {
  data: TreeItem[]
  value: string | null
  onSelect?: (filePath: string) => void
}

function TreeNode({
  item,
  selectedValue,
  onSelect,
  parentPath,
  depth,
}: {
  item: TreeItem
  selectedValue: string | null
  onSelect?: (filePath: string) => void
  parentPath: string
  depth: number
}) {
  const [open, setOpen] = useState(true)
  const [name, ...children] = Array.isArray(item) ? item : [item]
  const currentPath = parentPath ? `${parentPath}/${name}` : String(name)
  const isFolder = children.length > 0
  const indent = 8 + depth * 12

  if (!isFolder) {
    const isSelected = selectedValue === currentPath

    return (
      <button
        type="button"
        onClick={() => onSelect?.(currentPath)}
        style={{ paddingLeft: indent + 18 }}
        className={cn(
          'flex w-full items-center gap-2 py-1 pr-2 text-sm transition-colors hover:bg-[var(--color-muted)]',
          isSelected ? 'bg-[var(--color-accent)] font-medium text-indigo-100' : 'text-[var(--color-muted-foreground)]',
        )}
        title={String(name)}
      >
        <FileCode2 className="h-4 w-4 shrink-0 text-sky-400" />
        <span className="truncate">{name}</span>
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{ paddingLeft: indent }}
        className="flex w-full items-center gap-1.5 py-1 pr-2 text-sm text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)]"
        title={String(name)}
      >
        <ChevronRight className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-90')} />
        {open ? <FolderOpen className="h-4 w-4 shrink-0 text-sky-400" /> : <Folder className="h-4 w-4 shrink-0 text-sky-400" />}
        <span className="truncate font-medium">{name}</span>
      </button>

      {open &&
        children.map((child, index) => (
          <TreeNode
            key={index}
            item={child}
            selectedValue={selectedValue}
            onSelect={onSelect}
            parentPath={currentPath}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}

export function TreeView({ data, value, onSelect }: TreeViewProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0f0f12]">
      <div className="flex h-9 shrink-0 items-center border-b border-[var(--color-border)] px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        Files
      </div>
      <div className="min-h-0 flex-1 overflow-auto py-1">
        {data.length === 0 ? (
          <p className="px-3 py-4 text-xs text-[var(--color-muted-foreground)]">No files in this preview.</p>
        ) : (
          data.map((item, index) => (
            <TreeNode key={index} item={item} selectedValue={value} onSelect={onSelect} parentPath="" depth={0} />
          ))
        )}
      </div>
    </div>
  )
}
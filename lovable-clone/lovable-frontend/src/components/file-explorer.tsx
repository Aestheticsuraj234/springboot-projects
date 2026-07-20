import { useCallback, useEffect, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Copy, CopyCheck } from 'lucide-react'
import { TreeView } from '@/components/tree-view'
import { Button } from '@/components/ui/button'
import { convertFilesToTreeItems } from '@/lib/file-tree'
import { parseFragmentFiles } from '@/lib/fragment-files'
import type { Fragment } from '@/types/api'

interface FileExplorerProps {
  fragment: Fragment | null
}

function languageFromPath(path: string) {
  if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript'
  if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript'
  if (path.endsWith('.css')) return 'css'
  if (path.endsWith('.html')) return 'html'
  if (path.endsWith('.json')) return 'json'
  return 'plaintext'
}

export function FileExplorer({ fragment }: FileExplorerProps) {
  const files = useMemo(() => parseFragmentFiles(fragment?.files), [fragment])
  const treeData = useMemo(() => convertFilesToTreeItems(files), [files])
  const fileKeys = useMemo(() => Object.keys(files).sort(), [files])
  const [selectedFile, setSelectedFile] = useState<string | null>(() => fileKeys[0] ?? null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setSelectedFile(fileKeys[0] ?? null)
  }, [fragment?.id, fileKeys])

  const activeFile = selectedFile && files[selectedFile] ? selectedFile : fileKeys[0] ?? null
  const content = activeFile ? files[activeFile] : '// Select a file to view its contents.'

  const handleCopy = useCallback(async () => {
    if (!activeFile || !files[activeFile]) return

    await navigator.clipboard.writeText(files[activeFile])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [activeFile, files])

  if (!fragment || fileKeys.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted-foreground)]">
        Generated code will appear here after the AI responds.
      </div>
    )
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[240px_minmax(0,1fr)]">
      <TreeView
        data={treeData}
        value={activeFile}
        onSelect={(path) => {
          if (files[path]) {
            setSelectedFile(path)
          }
        }}
      />

      <div className="flex min-w-0 flex-col border-l border-[var(--color-border)]">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-2">
          <p className="truncate text-xs text-[var(--color-muted-foreground)]">{activeFile ?? 'Editor'}</p>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void handleCopy()}>
            {copied ? <CopyCheck className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="min-h-0 flex-1">
          <Editor
            height="100%"
            theme="vs-dark"
            language={activeFile ? languageFromPath(activeFile) : 'plaintext'}
            value={content}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </div>
  )
}

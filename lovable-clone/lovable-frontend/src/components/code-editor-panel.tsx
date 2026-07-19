import Editor from '@monaco-editor/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Fragment } from '@/types/api'

interface CodeEditorPanelProps {
  fragment: Fragment | null
  selectedFile: string | null
}

function languageFromPath(path: string) {
  if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript'
  if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript'
  if (path.endsWith('.css')) return 'css'
  if (path.endsWith('.html')) return 'html'
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.java')) return 'java'
  if (path.endsWith('.sql')) return 'sql'
  return 'plaintext'
}

export function CodeEditorPanel({ fragment, selectedFile }: CodeEditorPanelProps) {
  const content =
    fragment && selectedFile ? fragment.files?.[selectedFile] ?? '// Select a file to view its contents.' : '// Select a file to view its contents.'

  return (
    <div className="flex h-full flex-col border-r border-[var(--color-border)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-muted-foreground)]">
        {selectedFile ?? 'Editor'}
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          theme="vs-dark"
          language={selectedFile ? languageFromPath(selectedFile) : 'plaintext'}
          value={content}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on',
          }}
        />
      </div>
      <ScrollArea className="hidden" />
    </div>
  )
}

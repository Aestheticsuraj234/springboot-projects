import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ChatPanel } from '@/components/chat-panel'
import { FileExplorer } from '@/components/file-explorer'
import { CodeEditorPanel } from '@/components/code-editor-panel'
import { PreviewPanel } from '@/components/preview-panel'
import { Button } from '@/components/ui/button'
import { useMessages, useProject } from '@/hooks/use-api'

export function WorkspacePage() {
  const { projectId = '' } = useParams()
  const { data: project } = useProject(projectId)
  const { data: messages = [] } = useMessages(projectId)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview')

  const latestFragment = useMemo(() => {
    const withFragments = messages.filter((message) => message.fragment)
    return withFragments.at(-1)?.fragment ?? null
  }, [messages])

  const files = latestFragment ? Object.keys(latestFragment.files ?? {}) : []
  const currentFile = selectedFile ?? files[0] ?? null

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <p className="text-sm font-medium">{project?.name ?? 'Workspace'}</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">Project ID: {projectId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activeTab === 'editor' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'preview' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </Button>
          </div>
        </div>

        <div className="grid flex-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)_360px] xl:grid-cols-[280px_minmax(0,1fr)_420px]">
          <FileExplorer
            fragment={latestFragment}
            selectedFile={currentFile}
            onSelectFile={(path) => {
              setSelectedFile(path)
              setActiveTab('editor')
            }}
          />

          <div className="min-w-0 border-r border-[var(--color-border)]">
            {activeTab === 'editor' ? (
              <CodeEditorPanel fragment={latestFragment} selectedFile={currentFile} />
            ) : (
              <PreviewPanel fragment={latestFragment} />
            )}
          </div>

          <ChatPanel projectId={projectId} />
        </div>
      </div>
    </AppShell>
  )
}

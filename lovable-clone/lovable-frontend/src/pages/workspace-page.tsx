import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Code, Eye } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ChatPanel } from '@/components/chat-panel'
import { FileExplorer } from '@/components/file-explorer'
import { PreviewPanel } from '@/components/preview-panel'
import { ProjectHeader } from '@/components/project-header'
import { Button } from '@/components/ui/button'
import { useMessages } from '@/hooks/use-api'
import type { Fragment } from '@/types/api'

export function WorkspacePage() {
  const { projectId = '' } = useParams()
  const { data: messages = [] } = useMessages(projectId)
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const lastAssistantMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    const lastAssistantWithFragment = [...messages]
      .reverse()
      .find((message) => message.role === 'ASSISTANT' && message.fragment)

    if (
      lastAssistantWithFragment?.fragment &&
      lastAssistantWithFragment.id !== lastAssistantMessageIdRef.current
    ) {
      setActiveFragment(lastAssistantWithFragment.fragment)
      setActiveTab('preview')
      lastAssistantMessageIdRef.current = lastAssistantWithFragment.id
    }
  }, [messages])

  return (
    <AppShell>
      <div className="flex h-full overflow-hidden">
        <section className="flex w-[min(100%,420px)] min-w-[320px] flex-col border-r border-[var(--color-border)]">
          <ProjectHeader projectId={projectId} />
          <ChatPanel
            projectId={projectId}
            activeFragment={activeFragment}
            onFragmentSelect={(fragment) => {
              setActiveFragment(fragment)
              setActiveTab('preview')
            }}
            onPreviewReady={() => setActiveTab('preview')}
          />
        </section>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] p-2">
            <div className="inline-flex rounded-md border border-[var(--color-border)] p-0.5">
              <Button
                size="sm"
                variant={activeTab === 'preview' ? 'secondary' : 'ghost'}
                className="gap-2"
                onClick={() => setActiveTab('preview')}
              >
                <Eye className="h-4 w-4" />
                Demo
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'code' ? 'secondary' : 'ghost'}
                className="gap-2"
                onClick={() => setActiveTab('code')}
              >
                <Code className="h-4 w-4" />
                Code
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {activeTab === 'preview' ? (
              activeFragment ? (
                <PreviewPanel fragment={activeFragment} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted-foreground)]">
                  Your live preview will appear here after the AI generates code.
                </div>
              )
            ) : activeFragment ? (
              <FileExplorer fragment={activeFragment} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted-foreground)]">
                Select a preview from the chat to browse generated files.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

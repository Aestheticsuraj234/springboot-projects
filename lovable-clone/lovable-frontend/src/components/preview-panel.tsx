import { useState } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { SandpackProvider, SandpackPreview, SandpackLayout } from '@codesandbox/sandpack-react'
import { nightOwl } from '@codesandbox/sandpack-themes'
import { parseFragmentFiles } from '@/lib/fragment-files'
import { buildSandboxFiles, toSandpackFiles } from '@/lib/sandbox-template'
import { Button } from '@/components/ui/button'
import type { Fragment } from '@/types/api'

interface PreviewPanelProps {
  fragment: Fragment | null
}

function isLivePreviewUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

function DaytonaPreview({ fragment }: { fragment: Fragment }) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div>
          <p className="text-sm font-medium">{fragment.title}</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">Daytona live preview</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setRefreshKey((key) => key + 1)}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <a
            href={fragment.sandboxUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs hover:bg-[var(--color-muted)]"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-white">
        <iframe
          key={refreshKey}
          src={fragment.sandboxUrl}
          title={fragment.title}
          className="h-full w-full border-0"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  )
}

function SandpackPreviewPanel({ fragment }: { fragment: Fragment }) {
  const userFiles = parseFragmentFiles(fragment.files)
  const sandboxFiles = buildSandboxFiles(userFiles)
  const files = toSandpackFiles(sandboxFiles)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <p className="text-sm font-medium">{fragment.title}</p>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Sandpack preview · {Object.keys(userFiles).join(', ') || 'template'}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          template="react"
          theme={nightOwl}
          files={files}
          options={{
            externalResources: [],
            recompileMode: 'immediate',
          }}
        >
          <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 0 }}>
            <SandpackPreview style={{ height: '100%' }} showOpenInCodeSandbox={false} showRefreshButton />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  )
}

export function PreviewPanel({ fragment }: PreviewPanelProps) {
  if (!fragment) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-[var(--color-muted-foreground)]">
        Your live preview will appear here after the AI generates code.
      </div>
    )
  }

  if (isLivePreviewUrl(fragment.sandboxUrl)) {
    return <DaytonaPreview fragment={fragment} />
  }

  return <SandpackPreviewPanel fragment={fragment} />
}

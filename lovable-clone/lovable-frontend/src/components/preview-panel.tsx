import { SandpackProvider, SandpackPreview, SandpackLayout } from '@codesandbox/sandpack-react'
import { nightOwl } from '@codesandbox/sandpack-themes'
import type { Fragment } from '@/types/api'

interface PreviewPanelProps {
  fragment: Fragment | null
}

function normalizeFiles(files: Fragment['files'] | undefined): Record<string, string> {
  if (!files || typeof files !== 'object') return {}

  return Object.fromEntries(
    Object.entries(files).map(([path, value]) => [
      path,
      typeof value === 'string' ? value : JSON.stringify(value, null, 2),
    ]),
  )
}

function normalizeSandpackFiles(files: Record<string, string>) {
  const normalized: Record<string, { code: string }> = {}

  for (const [path, code] of Object.entries(files)) {
    const sandpackPath = path.startsWith('/') ? path : `/${path}`
    normalized[sandpackPath] = { code }
  }

  if (!normalized['/App.jsx'] && !normalized['/App.tsx']) {
    normalized['/App.jsx'] = {
      code: `export default function App() {
  return <div style={{ fontFamily: 'sans-serif', padding: 24 }}>No preview files yet.</div>
}`,
    }
  }

  return normalized
}

export function PreviewPanel({ fragment }: PreviewPanelProps) {
  if (!fragment) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-[var(--color-muted-foreground)]">
        Generated previews will appear here after you save a fragment from an assistant response.
      </div>
    )
  }

  const files = normalizeSandpackFiles(normalizeFiles(fragment.files))

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <p className="text-sm font-medium">{fragment.title}</p>
        <p className="text-xs text-[var(--color-muted-foreground)]">{fragment.sandboxUrl}</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <SandpackProvider template="react" theme={nightOwl} files={files} options={{ externalResources: [] }}>
          <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 0 }}>
            <SandpackPreview style={{ height: '100%' }} showOpenInCodeSandbox={false} />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProject } from '@/hooks/use-api'

interface ProjectHeaderProps {
  projectId: string
}

export function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const { data: project, isLoading } = useProject(projectId)

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Sparkles className="h-5 w-5 shrink-0 text-indigo-300" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {isLoading ? 'Loading project...' : (project?.name ?? 'Untitled Project')}
          </p>
        </div>
      </div>

      <Link to="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
      </Link>
    </header>
  )
}

export function ProjectHeaderLoading() {
  return (
    <header className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading project...
    </header>
  )
}

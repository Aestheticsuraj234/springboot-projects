import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreateProject, useDashboard, useDeleteProject } from '@/hooks/use-api'

export function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard()
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const [projectName, setProjectName] = useState('')

  async function handleCreateProject(event: React.FormEvent) {
    event.preventDefault()
    const name = projectName.trim()
    if (!name) return

    await createProject.mutateAsync(name)
    setProjectName('')
  }

  return (
    <AppShell>
      <div className="h-full overflow-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-[var(--color-muted-foreground)]">
              Manage projects, continue conversations, and open your AI workspace.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Total projects</CardDescription>
                <CardTitle>{dashboard?.projectCount ?? 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Recent conversations</CardDescription>
                <CardTitle>{dashboard?.projects.length ?? 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Workspace status</CardDescription>
                <CardTitle>Ready</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create a project</CardTitle>
              <CardDescription>Start a new AI-assisted full-stack build session.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => void handleCreateProject(event)}>
                <Input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Finance Tracker, Expense App, Portfolio Site..."
                />
                <Button type="submit" disabled={createProject.isPending}>
                  <Plus className="h-4 w-4" />
                  Create project
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-indigo-300" />
              <h2 className="text-xl font-semibold">Your projects</h2>
            </div>

            {isLoading && <p className="text-sm text-[var(--color-muted-foreground)]">Loading projects...</p>}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dashboard?.projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <CardDescription>
                          Updated {new Date(project.updatedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <Button className="w-full" variant="secondary">
                        Open workspace
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void deleteProject.mutateAsync(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { Sparkles, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <p className="text-sm font-semibold">SpringLovable</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">AI app builder</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button
              variant={location.pathname.startsWith('/dashboard') ? 'secondary' : 'ghost'}
              size="sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <div className="hidden text-sm text-[var(--color-muted-foreground)] sm:block">
            {user?.name ?? user?.email}
          </div>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </nav>
      </header>
      <main className={cn('flex-1 overflow-hidden')}>{children}</main>
    </div>
  )
}

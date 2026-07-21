"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useCurrentUser } from "@/hooks/use-auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();

  return (
    <AuthGuard>
      <div className="min-h-full bg-background">
        <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Google Photos Clone</h1>
              {user && (
                <p className="text-sm text-muted-foreground">Welcome, {user.displayName}</p>
              )}
            </div>
            <ModeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}

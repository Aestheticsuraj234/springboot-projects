"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useCurrentUser } from "@/hooks/use-auth";
import { usePhotoSelectionStore } from "@/stores/photo-selection-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();
  const pathname = usePathname();
  const exitSelectMode = usePhotoSelectionStore((state) => state.exitSelectMode);

  useEffect(() => {
    exitSelectMode();
  }, [pathname, exitSelectMode]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border/60 bg-card/40 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              {user ? `Signed in as ${user.displayName}` : "Loading account..."}
            </p>
          </header>
          <main className="flex-1 overflow-auto px-6 py-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

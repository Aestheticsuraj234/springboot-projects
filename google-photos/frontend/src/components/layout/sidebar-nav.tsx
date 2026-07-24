"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  FolderOpen,
  Images,
  LogOut,
  Trash2,
} from "lucide-react";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { StorageWidget } from "@/components/library/storage-widget";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import type { User } from "@/lib/api";

const navItems = [
  { href: "/photos", label: "Photos", icon: Images },
  { href: "/albums", label: "Albums", icon: FolderOpen },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

type SidebarNavProps = {
  user?: User | null;
  onNavigate?: () => void;
};

export function SidebarNav({ user, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Images className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">Google Photos</p>
            <p className="text-xs text-muted-foreground">Clone</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-sidebar-border px-3 py-4">
        <StorageWidget />

        {user && (
          <div className="rounded-xl bg-sidebar-accent/40 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Signed in as</p>
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl px-2 py-1.5">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>

        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground disabled:opacity-50"
        >
          {logoutMutation.isPending ? (
            <>
              <Spinner />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="size-4 shrink-0" />
              Sign out
          </>
          )}
        </button>
      </div>
    </div>
  );
}

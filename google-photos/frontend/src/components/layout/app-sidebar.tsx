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
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Spinner } from "@/components/ui/spinner";

const navItems = [
  { href: "/photos", label: "Photos", icon: Images },
  { href: "/albums", label: "Albums", icon: FolderOpen },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border/60 bg-card/30">
      <div className="border-b border-border/60 px-4 py-5">
        <h1 className="text-base font-semibold text-foreground">Google Photos</h1>
        <p className="text-xs text-muted-foreground">Clone</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border/60 p-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <>
              <Spinner />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="size-4" />
              Sign out
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthSession } from "@/hooks/use-auth";

type GuestGuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function GuestGuard({ children, redirectTo = "/photos" }: GuestGuardProps) {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthSession();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [hasHydrated, isAuthenticated, redirectTo, router]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background text-muted-foreground">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background text-muted-foreground">
        <Spinner className="size-6" />
      </div>
    );
  }

  return children;
}

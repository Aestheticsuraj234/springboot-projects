"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthSession, useCurrentUser } from "@/hooks/use-auth";

type AuthGuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthSession();
  const { isLoading } = useCurrentUser();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [hasHydrated, isAuthenticated, redirectTo, router]);

  if (!hasHydrated || !isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background text-muted-foreground">
        <Spinner className="size-6" />
      </div>
    );
  }

  return children;
}

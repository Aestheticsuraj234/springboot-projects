"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

type GuestGuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

/** For login/register pages — redirect away if already logged in. */
export function GuestGuard({ children, redirectTo = "/photos" }: GuestGuardProps) {
  const router = useRouter();
  const { isReady, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isReady && isLoggedIn) {
      router.replace(redirectTo);
    }
  }, [isReady, isLoggedIn, redirectTo, router]);

  if (!isReady || isLoggedIn) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background text-muted-foreground">
        <Spinner className="size-6" />
      </div>
    );
  }

  return children;
}

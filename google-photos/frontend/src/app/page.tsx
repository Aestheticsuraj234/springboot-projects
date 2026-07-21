"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthSession } from "@/hooks/use-auth";

export default function HomePage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthSession();

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(isAuthenticated ? "/photos" : "/login");
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <div className="flex min-h-full items-center justify-center bg-background text-muted-foreground">
      <Spinner className="size-6" />
    </div>
  );
}

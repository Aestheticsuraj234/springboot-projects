"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const router = useRouter();
  const { isReady, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    router.replace(isLoggedIn ? "/photos" : "/login");
  }, [isReady, isLoggedIn, router]);

  return (
    <div className="flex min-h-full items-center justify-center bg-background text-muted-foreground">
      <Spinner className="size-6" />
    </div>
  );
}

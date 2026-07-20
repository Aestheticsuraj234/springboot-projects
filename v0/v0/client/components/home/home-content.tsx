"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export function HomeContent() {
  const logout = useLogout();
  const { isAuthenticated, email, username } = useAuthStore();

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to v0</CardTitle>
          <CardDescription>
            {isAuthenticated
              ? "You are signed in and ready to go."
              : "Sign in or create an account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isAuthenticated ? (
            <>
              <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                {username && (
                  <p>
                    <span className="text-muted-foreground">Username:</span>{" "}
                    <span className="font-medium">{username}</span>
                  </p>
                )}
                {email && (
                  <p className={username ? "mt-1" : undefined}>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button render={<Link href="/login" />} nativeButton={false}>
                Sign in
              </Button>
              <Button
                variant="outline"
                render={<Link href="/register" />}
                nativeButton={false}
              >
                Create account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";

import { ModeToggle } from "@/components/ui/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="mb-8 text-center">
        <Link
          href="/"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          v0
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in or create an account to continue
        </p>
      </div>

      {children}
    </div>
  );
}

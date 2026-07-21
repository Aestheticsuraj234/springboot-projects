import Link from "next/link";
import { GuestGuard } from "@/components/auth/guest-guard";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="relative flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
        <div className="absolute right-4 top-4">
          <ModeToggle />
        </div>

        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground">
            Google Photos Clone
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Store, organize, and edit your memories
          </p>
        </div>

        <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </GuestGuard>
  );
}

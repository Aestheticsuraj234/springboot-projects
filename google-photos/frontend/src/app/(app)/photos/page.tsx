"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

export default function PhotosPage() {
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Photos</h2>
          <p className="text-sm text-muted-foreground">
            Phase 1 complete — upload and albums coming in Phase 2.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <>
              <Spinner />
              Signing out...
            </>
          ) : (
            "Sign out"
          )}
        </Button>
      </div>

      <Card className="border-dashed border-border/80 bg-card/60">
        <CardHeader>
          <CardTitle>Your library is ready</CardTitle>
          <CardDescription>
            {user
              ? `Signed in as ${user.email}`
              : "Your photo library will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Next up: ImageKit uploads, albums, archive, and trash.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

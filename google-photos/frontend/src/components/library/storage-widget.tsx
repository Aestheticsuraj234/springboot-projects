"use client";

import { HardDrive } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useStorageUsage } from "@/hooks/use-library";
import { formatBytes } from "@/lib/format-bytes";

const DISPLAY_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

export function StorageWidget() {
  const { data, isLoading } = useStorageUsage();

  if (isLoading) {
    return <Skeleton className="mx-3 h-20 rounded-xl" />;
  }

  if (!data) {
    return null;
  }

  const usedPercent = Math.min(100, (data.libraryUsedBytes / DISPLAY_QUOTA_BYTES) * 100);

  return (
    <div className="mx-3 rounded-xl bg-sidebar-accent/40 px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-sidebar-foreground">
        <HardDrive className="size-4" />
        Library storage
      </div>
      <Progress value={usedPercent} className="mb-2 h-2" />
      <p className="text-xs text-muted-foreground">
        {formatBytes(data.libraryUsedBytes)} used · {data.libraryPhotoCount} photos
      </p>
    </div>
  );
}

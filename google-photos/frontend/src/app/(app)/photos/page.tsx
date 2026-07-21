"use client";

import { Images } from "lucide-react";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoUploadButton } from "@/components/photos/photo-upload-button";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useLogout } from "@/hooks/use-auth";
import { usePhotos } from "@/hooks/use-photos";

export default function PhotosPage() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = usePhotos();
  const logoutMutation = useLogout();

  const photos = data?.pages.flatMap((page) => page.content) ?? [];
  const totalPhotos = data?.pages[0]?.totalElements ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Photos</h2>
          <p className="text-sm text-muted-foreground">
            {totalPhotos > 0
              ? `${totalPhotos} photo${totalPhotos === 1 ? "" : "s"} in your library`
              : "Upload your first photo to get started"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PhotoUploadButton />
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
      </div>

      {photos.length === 0 && !isLoading ? (
        <Empty className="border border-dashed border-border/80 bg-card/40">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Images />
            </EmptyMedia>
            <EmptyTitle>No photos yet</EmptyTitle>
            <EmptyDescription>
              Upload images from your computer. They will be stored in ImageKit and appear here
              instantly.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <PhotoUploadButton />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <PhotoGrid photos={photos} isLoading={isLoading} />

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Spinner />
                    Loading more...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

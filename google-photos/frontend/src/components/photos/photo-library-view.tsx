"use client";

import { useState } from "react";
import { CheckSquare, CloudDownload } from "lucide-react";
import { ImportImageKitDialog } from "@/components/library/import-imagekit-dialog";
import { PhotoBulkToolbar } from "@/components/photos/photo-bulk-toolbar";
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
import { usePhotos } from "@/hooks/use-photos";
import type { PhotoStatus } from "@/lib/api";
import { usePhotoSelectionStore } from "@/stores/photo-selection-store";

type PhotoLibraryViewProps = {
  title: string;
  description: string;
  status: PhotoStatus;
  emptyTitle: string;
  emptyDescription: string;
  showUpload?: boolean;
  showTrashAction?: boolean;
};

export function PhotoLibraryView({
  title,
  description,
  status,
  emptyTitle,
  emptyDescription,
  showUpload = false,
  showTrashAction = false,
}: PhotoLibraryViewProps) {
  const [importOpen, setImportOpen] = useState(false);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = usePhotos(status);
  const isSelectMode = usePhotoSelectionStore((state) => state.isSelectMode);
  const enterSelectMode = usePhotoSelectionStore((state) => state.enterSelectMode);
  const exitSelectMode = usePhotoSelectionStore((state) => state.exitSelectMode);

  const photos = data?.pages.flatMap((page) => page.content) ?? [];
  const photoIds = photos.map((photo) => photo.id);
  const totalPhotos = data?.pages[0]?.totalElements ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalPhotos > 0
              ? `${totalPhotos} photo${totalPhotos === 1 ? "" : "s"}`
              : description}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {photos.length > 0 && (
            <Button
              variant="outline"
              onClick={() => (isSelectMode ? exitSelectMode() : enterSelectMode())}
            >
              <CheckSquare className="size-4" />
              {isSelectMode ? "Cancel selection" : "Select photos"}
            </Button>
          )}
          {showUpload && <PhotoUploadButton />}
          {showUpload && (
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <CloudDownload className="size-4" />
              Import from ImageKit
            </Button>
          )}
        </div>
      </div>

      <ImportImageKitDialog open={importOpen} onOpenChange={setImportOpen} />

      <PhotoBulkToolbar photoIds={photoIds} context={status} />

      {photos.length === 0 && !isLoading ? (
        <Empty className="border border-dashed border-border/80 bg-card/40">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckSquare />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
          {showUpload && (
            <EmptyContent>
              <PhotoUploadButton />
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <>
          <PhotoGrid
            photos={photos}
            isLoading={isLoading}
            selectable
            showTrashAction={showTrashAction && !isSelectMode}
          />

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

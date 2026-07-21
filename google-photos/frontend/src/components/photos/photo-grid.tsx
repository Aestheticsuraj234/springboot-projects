"use client";

import Image from "next/image";
import { Check, Trash2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useRemovePhotoFromAlbum } from "@/hooks/use-albums";
import { useTrashPhotos } from "@/hooks/use-photos";
import type { Photo } from "@/lib/api";
import { cn } from "@/lib/utils";
import { usePhotoSelectionStore } from "@/stores/photo-selection-store";

type PhotoGridProps = {
  photos: Photo[];
  isLoading?: boolean;
  selectable?: boolean;
  showTrashAction?: boolean;
  albumId?: string;
};

export function PhotoGrid({
  photos,
  isLoading,
  selectable = false,
  showTrashAction = false,
  albumId,
}: PhotoGridProps) {
  const trashMutation = useTrashPhotos();
  const removeFromAlbumMutation = useRemovePhotoFromAlbum(albumId ?? "");
  const isSelectMode = usePhotoSelectionStore((state) => state.isSelectMode);
  const selectedIds = usePhotoSelectionStore((state) => state.selectedIds);
  const togglePhoto = usePhotoSelectionStore((state) => state.togglePhoto);
  const enterSelectMode = usePhotoSelectionStore((state) => state.enterSelectMode);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {photos.map((photo) => {
        const isSelected = selectedIds.includes(photo.id);

        return (
          <article
            key={photo.id}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-card/40 transition-colors",
              isSelected ? "border-primary ring-2 ring-primary/40" : "border-border/60",
            )}
          >
            <AspectRatio ratio={1}>
              <Image
                src={photo.thumbnailUrl ?? photo.url}
                alt={photo.fileName}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </AspectRatio>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="truncate text-xs text-white">{photo.fileName}</p>
            </div>

            {selectable && (
              <button
                type="button"
                className={cn(
                  "absolute inset-0 z-10",
                  !isSelectMode && "cursor-default",
                )}
                onClick={() => {
                  if (!isSelectMode) {
                    enterSelectMode();
                  }
                  togglePhoto(photo.id);
                }}
                aria-label={`Select ${photo.fileName}`}
              >
                <div className="absolute top-2 left-2">
                  {isSelectMode ? (
                    <Checkbox checked={isSelected} className="bg-background/90" />
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </div>
              </button>
            )}

            {showTrashAction && !isSelectMode && (
              <Button
                type="button"
                variant="destructive"
                size="icon-xs"
                className="absolute top-2 right-2 z-20 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={trashMutation.isPending}
                onClick={() => trashMutation.mutate([photo.id])}
                aria-label={`Move ${photo.fileName} to trash`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}

            {albumId && !isSelectMode && (
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                className="absolute top-2 right-2 z-20 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={removeFromAlbumMutation.isPending}
                onClick={() => removeFromAlbumMutation.mutate(photo.id)}
                aria-label={`Remove ${photo.fileName} from album`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </article>
        );
      })}
    </div>
  );
}

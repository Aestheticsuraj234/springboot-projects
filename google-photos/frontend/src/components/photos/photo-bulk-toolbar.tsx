"use client";

import { useState } from "react";
import {
  Archive,
  CheckSquare,
  FolderPlus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { AddToAlbumDialog } from "@/components/albums/add-to-album-dialog";
import { Button } from "@/components/ui/button";
import {
  useArchivePhotos,
  usePermanentlyDeletePhotos,
  useRestorePhotos,
  useTrashPhotos,
} from "@/hooks/use-photos";
import { usePhotoSelectionStore } from "@/stores/photo-selection-store";
import type { PhotoStatus } from "@/lib/api";

type PhotoBulkToolbarProps = {
  photoIds: string[];
  context: PhotoStatus;
};

export function PhotoBulkToolbar({ photoIds, context }: PhotoBulkToolbarProps) {
  const [addToAlbumOpen, setAddToAlbumOpen] = useState(false);
  const selectedIds = usePhotoSelectionStore((state) => state.selectedIds);
  const selectAll = usePhotoSelectionStore((state) => state.selectAll);
  const clearSelection = usePhotoSelectionStore((state) => state.clearSelection);
  const exitSelectMode = usePhotoSelectionStore((state) => state.exitSelectMode);

  const archiveMutation = useArchivePhotos();
  const trashMutation = useTrashPhotos();
  const restoreMutation = useRestorePhotos();
  const deleteMutation = usePermanentlyDeletePhotos();

  const isBusy =
    archiveMutation.isPending ||
    trashMutation.isPending ||
    restoreMutation.isPending ||
    deleteMutation.isPending;

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/95 p-3 backdrop-blur-sm">
        <span className="text-sm font-medium text-foreground">
          {selectedIds.length} selected
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => selectAll(photoIds)}
          disabled={isBusy || selectedIds.length === photoIds.length}
        >
          <CheckSquare className="size-4" />
          Select all
        </Button>

        <Button variant="outline" size="sm" onClick={clearSelection} disabled={isBusy}>
          Clear
        </Button>

        {context === "ACTIVE" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => archiveMutation.mutate(selectedIds)}
              disabled={isBusy}
            >
              <Archive className="size-4" />
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddToAlbumOpen(true)}
              disabled={isBusy}
            >
              <FolderPlus className="size-4" />
              Add to album
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => trashMutation.mutate(selectedIds)}
              disabled={isBusy}
            >
              <Trash2 className="size-4" />
              Move to trash
            </Button>
          </>
        )}

        {context === "ARCHIVED" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => restoreMutation.mutate(selectedIds)}
              disabled={isBusy}
            >
              <RotateCcw className="size-4" />
              Restore
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => trashMutation.mutate(selectedIds)}
              disabled={isBusy}
            >
              <Trash2 className="size-4" />
              Move to trash
            </Button>
          </>
        )}

        {context === "TRASH" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => restoreMutation.mutate(selectedIds)}
              disabled={isBusy}
            >
              <RotateCcw className="size-4" />
              Restore
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(selectedIds)}
              disabled={isBusy}
            >
              <Trash2 className="size-4" />
              Delete forever
            </Button>
          </>
        )}

        <Button variant="ghost" size="icon-sm" onClick={exitSelectMode} disabled={isBusy}>
          <X className="size-4" />
        </Button>
      </div>

      <AddToAlbumDialog
        open={addToAlbumOpen}
        onOpenChange={setAddToAlbumOpen}
        photoIds={selectedIds}
      />
    </>
  );
}

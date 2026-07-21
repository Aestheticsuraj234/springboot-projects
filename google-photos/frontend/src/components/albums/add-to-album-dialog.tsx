"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAddPhotosToAlbum, useAlbums } from "@/hooks/use-albums";
import { usePhotoSelectionStore } from "@/stores/photo-selection-store";

type AddToAlbumDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoIds: string[];
};

export function AddToAlbumDialog({ open, onOpenChange, photoIds }: AddToAlbumDialogProps) {
  const { data: albums = [], isLoading } = useAlbums();
  const addMutation = useAddPhotosToAlbum();
  const exitSelectMode = usePhotoSelectionStore((state) => state.exitSelectMode);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  async function handleAdd() {
    if (!selectedAlbumId) {
      return;
    }

    await addMutation.mutateAsync({ albumId: selectedAlbumId, photoIds });
    exitSelectMode();
    setSelectedAlbumId(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to album</DialogTitle>
          <DialogDescription>
            Choose an album for {photoIds.length} selected photo
            {photoIds.length === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading albums...</p>
          ) : albums.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No albums yet. Create one from the Albums page first.
            </p>
          ) : (
            albums.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelectedAlbumId(album.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selectedAlbumId === album.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 hover:bg-muted/50"
                }`}
              >
                <span>{album.title}</span>
                <span className="text-xs text-muted-foreground">{album.photoCount} photos</span>
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleAdd}
            disabled={!selectedAlbumId || addMutation.isPending || albums.length === 0}
          >
            {addMutation.isPending ? (
              <>
                <Spinner />
                Adding...
              </>
            ) : (
              "Add to album"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

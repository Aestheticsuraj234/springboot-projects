"use client";

import { FolderOpen } from "lucide-react";
import { AlbumGrid } from "@/components/albums/album-grid";
import { CreateAlbumDialog } from "@/components/albums/create-album-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useAlbums } from "@/hooks/use-albums";

export default function AlbumsPage() {
  const { data: albums = [], isLoading } = useAlbums();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Albums</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {albums.length > 0
              ? `${albums.length} album${albums.length === 1 ? "" : "s"}`
              : "Create albums to organize your photos"}
          </p>
        </div>
        <CreateAlbumDialog />
      </div>

      {albums.length === 0 && !isLoading ? (
        <Empty className="border border-dashed border-border/80 bg-card/40">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen />
            </EmptyMedia>
            <EmptyTitle>No albums yet</EmptyTitle>
            <EmptyDescription>
              Albums help you group photos by event, trip, or theme.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateAlbumDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <AlbumGrid albums={albums} isLoading={isLoading} />
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useAlbum, useAlbumPhotos, useDeleteAlbum } from "@/hooks/use-albums";

export default function AlbumDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const albumId = params.id;
  const { data: album, isLoading: albumLoading } = useAlbum(albumId);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useAlbumPhotos(albumId);
  const deleteAlbumMutation = useDeleteAlbum();

  const photos = data?.pages.flatMap((page) => page.content) ?? [];
  const totalPhotos = data?.pages[0]?.totalElements ?? album?.photoCount ?? 0;

  if (albumLoading) {
    return <p className="text-sm text-muted-foreground">Loading album...</p>;
  }

  if (!album) {
    return <p className="text-sm text-destructive">Album not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/albums"
            className="inline-flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to albums
          </Link>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{album.title}</h2>
            <p className="text-sm text-muted-foreground">
              {totalPhotos} photo{totalPhotos === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={() =>
            deleteAlbumMutation.mutate(albumId, {
              onSuccess: () => router.push("/albums"),
            })
          }
          disabled={deleteAlbumMutation.isPending}
        >
          {deleteAlbumMutation.isPending ? (
            <>
              <Spinner />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="size-4" />
              Delete album
            </>
          )}
        </Button>
      </div>

      {photos.length === 0 && !isLoading ? (
        <Empty className="border border-dashed border-border/80 bg-card/40">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArrowLeft />
            </EmptyMedia>
            <EmptyTitle>No photos in this album</EmptyTitle>
            <EmptyDescription>
              Select photos from your library and add them to this album.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <PhotoGrid photos={photos} isLoading={isLoading} albumId={albumId} />

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

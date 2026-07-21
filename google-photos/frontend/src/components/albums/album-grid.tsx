"use client";

import Link from "next/link";
import Image from "next/image";
import { FolderOpen } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import type { Album } from "@/lib/api";

type AlbumGridProps = {
  albums: Album[];
  isLoading?: boolean;
};

export function AlbumGrid({ albums, isLoading }: AlbumGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/3] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/albums/${album.id}`}
          className="group overflow-hidden rounded-xl border border-border/60 bg-card/40 transition-colors hover:border-primary/40"
        >
          <AspectRatio ratio={4 / 3} className="bg-muted/40">
            {album.coverThumbnailUrl ? (
              <Image
                src={album.coverThumbnailUrl}
                alt={album.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <FolderOpen className="size-10 opacity-50" />
              </div>
            )}
          </AspectRatio>
          <div className="space-y-1 p-3">
            <h3 className="truncate font-medium text-foreground">{album.title}</h3>
            <p className="text-xs text-muted-foreground">
              {album.photoCount} photo{album.photoCount === 1 ? "" : "s"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Photo } from "@/lib/api";
import { useDeletePhoto } from "@/hooks/use-photos";

type PhotoGridProps = {
  photos: Photo[];
  isLoading?: boolean;
};

export function PhotoGrid({ photos, isLoading }: PhotoGridProps) {
  const deleteMutation = useDeletePhoto();

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
      {photos.map((photo) => (
        <article
          key={photo.id}
          className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40"
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

          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(photo.id)}
            aria-label={`Delete ${photo.fileName}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </article>
      ))}
    </div>
  );
}

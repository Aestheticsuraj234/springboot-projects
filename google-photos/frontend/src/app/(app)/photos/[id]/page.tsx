"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PhotoAiEditor } from "@/components/photos/photo-ai-editor";
import { usePhoto } from "@/hooks/use-ai";

export default function PhotoDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: photo, isLoading, isError } = usePhoto(params.id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading photo...</p>;
  }

  if (isError || !photo) {
    return <p className="text-sm text-destructive">Photo not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/photos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to photos
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{photo.fileName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {photo.width && photo.height ? `${photo.width} × ${photo.height}` : "Dimensions unknown"}
            {photo.aiTransformType ? ` · AI: ${photo.aiTransformType.replaceAll("_", " ").toLowerCase()}` : ""}
          </p>
        </div>
      </div>

      <PhotoAiEditor photo={photo} />
    </div>
  );
}

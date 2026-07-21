"use client";

import { PhotoLibraryView } from "@/components/photos/photo-library-view";

export default function PhotosPage() {
  return (
    <PhotoLibraryView
      title="Photos"
      description="Upload your first photo to get started"
      status="ACTIVE"
      emptyTitle="No photos yet"
      emptyDescription="Upload images from your computer. They will be stored in ImageKit and appear here instantly."
      showUpload
      showTrashAction
    />
  );
}

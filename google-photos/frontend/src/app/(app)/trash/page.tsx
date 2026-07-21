"use client";

import { PhotoLibraryView } from "@/components/photos/photo-library-view";

export default function TrashPage() {
  return (
    <PhotoLibraryView
      title="Trash"
      description="Deleted photos stay here until permanently removed"
      status="TRASH"
      emptyTitle="Trash is empty"
      emptyDescription="Photos moved to trash can be restored or deleted forever."
    />
  );
}

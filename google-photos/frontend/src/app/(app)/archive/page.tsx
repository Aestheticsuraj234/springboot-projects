"use client";

import { PhotoLibraryView } from "@/components/photos/photo-library-view";

export default function ArchivePage() {
  return (
    <PhotoLibraryView
      title="Archive"
      description="Archived photos are hidden from your main library"
      status="ARCHIVED"
      emptyTitle="Archive is empty"
      emptyDescription="Photos you archive will appear here. You can restore them anytime."
    />
  );
}

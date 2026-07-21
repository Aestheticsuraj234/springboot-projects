"use client";

import { useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadPhotos } from "@/hooks/use-photos";

type UploadProgress = {
  fileName: string;
  progress: number;
};

export function PhotoUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadPhotos();
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  function handleSelect() {
    inputRef.current?.click();
  }

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setUploads(files.map((file) => ({ fileName: file.name, progress: 0 })));

    try {
      await uploadMutation.mutateAsync({
        files,
        onFileProgress: (fileName, progress) => {
          setUploads((current) =>
            current.map((item) =>
              item.fileName === fileName ? { ...item, progress } : item,
            ),
          );
        },
      });
    } finally {
      setUploads([]);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      <Button onClick={handleSelect} disabled={uploadMutation.isPending}>
        {uploadMutation.isPending ? (
          <>
            <Upload className="size-4" />
            Uploading...
          </>
        ) : (
          <>
            <ImagePlus className="size-4" />
            Upload photos
          </>
        )}
      </Button>

      {uploads.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(100vw-2rem,22rem)] space-y-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Upload className="size-4" />
            Uploading {uploads.length} file{uploads.length === 1 ? "" : "s"}
          </div>
          {uploads.map((upload) => (
            <div key={upload.fileName} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{upload.fileName}</span>
                <span className="shrink-0">{upload.progress}%</span>
              </div>
              <Progress value={upload.progress} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

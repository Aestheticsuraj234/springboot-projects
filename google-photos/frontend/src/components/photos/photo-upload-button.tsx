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
    <div className="flex flex-col gap-3">
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
        <div className="space-y-2 rounded-xl border border-border/60 bg-card/50 p-3">
          {uploads.map((upload) => (
            <div key={upload.fileName} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{upload.fileName}</span>
                <span>{upload.progress}%</span>
              </div>
              <Progress value={upload.progress} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

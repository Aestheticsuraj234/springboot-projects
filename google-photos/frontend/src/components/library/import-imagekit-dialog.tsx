"use client";

import { useState } from "react";
import Image from "next/image";
import { CloudDownload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useImportImageKitAssets } from "@/hooks/use-ai";
import { useImageKitAssets } from "@/hooks/use-library";

type ImportImageKitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportImageKitDialog({ open, onOpenChange }: ImportImageKitDialogProps) {
  const { data: assets = [], isLoading, refetch } = useImageKitAssets();
  const importMutation = useImportImageKitAssets();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const importableAssets = assets.filter((asset) => !asset.alreadyImported);

  function toggleAsset(fileId: string) {
    setSelectedIds((current) =>
      current.includes(fileId) ? current.filter((id) => id !== fileId) : [...current, fileId],
    );
  }

  async function handleImport() {
    await importMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (nextOpen) {
          refetch();
        } else {
          setSelectedIds([]);
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import from ImageKit</DialogTitle>
          <DialogDescription>
            Bring files already stored in your ImageKit folder into this library.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading ImageKit assets...</p>
          ) : importableAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No new ImageKit files found in your folder.
            </p>
          ) : (
            importableAssets.map((asset) => (
              <button
                key={asset.fileId}
                type="button"
                onClick={() => toggleAsset(asset.fileId)}
                className="flex w-full items-center gap-3 rounded-xl border border-border/60 p-2 text-left hover:bg-muted/40"
              >
                <Checkbox checked={selectedIds.includes(asset.fileId)} />
                <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                  {asset.thumbnailUrl && (
                    <Image src={asset.thumbnailUrl} alt={asset.fileName} fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{asset.fileName}</p>
                  <p className="text-xs text-muted-foreground">{asset.fileId}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleImport}
            disabled={selectedIds.length === 0 || importMutation.isPending}
          >
            {importMutation.isPending ? (
              <>
                <Spinner />
                Importing...
              </>
            ) : (
              <>
                <CloudDownload className="size-4" />
                Import {selectedIds.length || ""} selected
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

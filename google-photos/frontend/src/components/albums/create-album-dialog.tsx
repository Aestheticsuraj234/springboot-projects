"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCreateAlbum } from "@/hooks/use-albums";

const schema = z.object({
  title: z.string().trim().min(1, "Album title is required").max(120),
});

type FormValues = z.infer<typeof schema>;

type CreateAlbumDialogProps = {
  trigger?: React.ReactNode;
};

export function CreateAlbumDialog({ trigger }: CreateAlbumDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateAlbum();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "" },
  });

  async function onSubmit(values: FormValues) {
    await createMutation.mutateAsync(values.title);
    form.reset();
    setOpen(false);
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New album
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create album</DialogTitle>
          <DialogDescription>Group photos together under a shared title.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="album-title">Title</Label>
            <Input id="album-title" placeholder="Summer trip" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                "Create album"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

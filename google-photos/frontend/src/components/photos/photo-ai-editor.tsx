"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAiApply, useAiPreview } from "@/hooks/use-ai";
import type { AiTransformRequest, AiTransformType, Photo } from "@/lib/api";

const TRANSFORMS: {
  type: AiTransformType;
  label: string;
  description: string;
  needsPrompt?: boolean;
  needsDimensions?: boolean;
  needsFocus?: boolean;
}[] = [
  {
    type: "REMOVE_BACKGROUND",
    label: "Remove background",
    description: "Isolate the subject with ImageKit AI",
  },
  {
    type: "BACKGROUND_AND_SHADOW",
    label: "Background + shadow",
    description: "Remove background and add a drop shadow",
  },
  {
    type: "CHANGE_BACKGROUND",
    label: "Change background",
    description: "Replace the scene using a text prompt",
    needsPrompt: true,
  },
  {
    type: "GENERATIVE_FILL",
    label: "Generative fill",
    description: "Extend the canvas with AI-generated content",
    needsPrompt: true,
    needsDimensions: true,
  },
  {
    type: "SMART_CROP",
    label: "Smart crop",
    description: "Object-aware crop to a target size",
    needsDimensions: true,
  },
  {
    type: "OBJECT_CROP",
    label: "Object crop",
    description: "Crop around a named object (e.g. dog, cat)",
    needsFocus: true,
  },
  { type: "RETOUCH", label: "Retouch", description: "Improve overall image quality" },
  { type: "UPSCALE", label: "Upscale", description: "Increase resolution with AI upscaling" },
  {
    type: "AI_EDIT",
    label: "AI edit",
    description: "Edit the image using a natural language prompt",
    needsPrompt: true,
  },
];

type PhotoAiEditorProps = {
  photo: Photo;
};

export function PhotoAiEditor({ photo }: PhotoAiEditorProps) {
  const [selectedType, setSelectedType] = useState<AiTransformType>("REMOVE_BACKGROUND");
  const [prompt, setPrompt] = useState("");
  const [focusObject, setFocusObject] = useState("");
  const [width, setWidth] = useState(String(photo.width ?? 1200));
  const [height, setHeight] = useState(String(photo.height ?? 800));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const previewMutation = useAiPreview(photo.id);
  const applyMutation = useAiApply(photo.id);

  const selectedTransform = TRANSFORMS.find((item) => item.type === selectedType)!;

  useEffect(() => {
    setPreviewUrl(null);
  }, [selectedType, prompt, focusObject, width, height, photo.id]);

  function buildRequest(): AiTransformRequest {
    return {
      type: selectedType,
      prompt: prompt.trim() || undefined,
      focusObject: focusObject.trim() || undefined,
      width: Number(width) || undefined,
      height: Number(height) || undefined,
    };
  }

  async function handlePreview() {
    const response = await previewMutation.mutateAsync(buildRequest());
    setPreviewUrl(response.previewUrl);
  }

  async function handleApply() {
    const saved = await applyMutation.mutateAsync(buildRequest());
    window.location.href = `/photos/${saved.id}`;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">AI transforms</h3>
        </div>

        <div className="space-y-2">
          {TRANSFORMS.map((transform) => (
            <button
              key={transform.type}
              type="button"
              onClick={() => setSelectedType(transform.type)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                selectedType === transform.type
                  ? "border-primary bg-primary/10"
                  : "border-border/60 hover:bg-muted/40"
              }`}
            >
              <p className="text-sm font-medium">{transform.label}</p>
              <p className="text-xs text-muted-foreground">{transform.description}</p>
            </button>
          ))}
        </div>

        {selectedTransform.needsPrompt && (
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Prompt</Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the background or edit you want"
              rows={3}
            />
          </div>
        )}

        {selectedTransform.needsFocus && (
          <div className="space-y-2">
            <Label htmlFor="ai-focus">Object</Label>
            <Input
              id="ai-focus"
              value={focusObject}
              onChange={(event) => setFocusObject(event.target.value)}
              placeholder="dog, cat, person..."
            />
          </div>
        )}

        {selectedTransform.needsDimensions && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ai-width">Width</Label>
              <Input
                id="ai-width"
                type="number"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-height">Height</Label>
              <Input
                id="ai-height"
                type="number"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={previewMutation.isPending || applyMutation.isPending}
          >
            {previewMutation.isPending ? (
              <>
                <Spinner />
                Generating preview...
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                Preview transform
              </>
            )}
          </Button>
          <Button onClick={handleApply} disabled={applyMutation.isPending || previewMutation.isPending}>
            {applyMutation.isPending ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              "Save as new photo"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Powered by ImageKit AI URL transforms. Previews may take a few seconds on first run.
        </p>
      </aside>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <figure className="overflow-hidden rounded-2xl border border-border/60 bg-card/30">
            <div className="border-b border-border/60 px-4 py-2 text-sm font-medium">Original</div>
            <div className="relative aspect-[4/3]">
              <Image src={photo.url} alt={photo.fileName} fill className="object-contain" />
            </div>
          </figure>

          <figure className="overflow-hidden rounded-2xl border border-border/60 bg-card/30">
            <div className="border-b border-border/60 px-4 py-2 text-sm font-medium">Preview</div>
            <div className="relative aspect-[4/3] bg-muted/20">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={`${photo.fileName} preview`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  Run a preview to see the AI result here.
                </div>
              )}
            </div>
          </figure>
        </div>
      </div>
    </div>
  );
}

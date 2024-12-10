"use client";

import Image from "next/image";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading";

interface ImagePreviewProps {
  url: string | null;
  prompt: string;
  generating: boolean;
}

export function ImagePreview({ url, prompt, generating }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);

  if (generating) {
    return (
      <div className="relative aspect-square w-full rounded-lg border bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground">正在生成图片...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="relative aspect-square w-full rounded-lg border bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">在这里预览生成的图片</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full">
      <Image
        src={url}
        alt={prompt}
        fill
        className={`rounded-lg object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoadingComplete={() => setLoading(false)}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border bg-muted">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

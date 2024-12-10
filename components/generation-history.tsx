"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ImageCard } from "@/components/image-card";
import { LoadingCard } from "@/components/ui/loading";
import type { Image } from "@/types/database";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function GenerationHistory() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;
    let channel = supabase.channel("images_changes");

    const fetchImages = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !mounted) return;

        const { data, error: fetchError } = await supabase
          .from("images")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (fetchError) throw fetchError;
        if (mounted) {
          setImages(data || []);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        if (mounted) {
          setError("加载历史记录失败");
          setImages([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // 初始加载
    fetchImages();

    // 订阅实时更新
    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      channel = channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "images",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<Image>) => {
            if (mounted) {
              const newImage = payload.new as Image;
              setImages((current) => [newImage, ...current.slice(0, 2)]);
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">最近生成</h2>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">最近生成</h2>
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (!images.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">最近生成</h2>
      <div className="grid gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            id={image.id}
            url={image.url}
            prompt={image.prompt}
            style={image.style}
            createdAt={image.created_at}
            likesCount={image.likes_count}
            isPublic={image.is_public}
          />
        ))}
      </div>
    </div>
  );
}

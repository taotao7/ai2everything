"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  imageId: string;
  initialLikesCount: number;
}

export function LikeButton({ imageId, initialLikesCount }: LikeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkLikeStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("likes")
        .select()
        .eq("image_id", imageId)
        .eq("user_id", user.id)
        .single();

      setLiked(!!data);
    };

    checkLikeStatus();
  }, [imageId, supabase]);

  const toggleLike = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (liked) {
        await supabase
          .from("likes")
          .delete()
          .eq("image_id", imageId)
          .eq("user_id", user.id);
        setLikesCount((prev) => prev - 1);
      } else {
        await supabase
          .from("likes")
          .insert({ image_id: imageId, user_id: user.id });
        setLikesCount((prev) => prev + 1);
      }

      setLiked(!liked);
      router.refresh();
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
    >
      <span>{likesCount}</span>
      <span>{loading ? "更新中..." : liked ? "取消点赞" : "点赞"}</span>
    </button>
  );
}

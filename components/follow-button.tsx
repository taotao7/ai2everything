"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  userId: string;
  initialFollowersCount: number;
}

export function FollowButton({
  userId,
  initialFollowersCount,
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkFollowStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("follows")
        .select()
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .single();

      setFollowing(!!data);
    };

    checkFollowStatus();
  }, [userId, supabase]);

  const handleFollow = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (following) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        setFollowersCount((prev) => prev - 1);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: userId });
        setFollowersCount((prev) => prev + 1);
      }

      setFollowing(!following);
      router.refresh();
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
          following
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {loading ? "处理中..." : following ? "取消关注" : "关注"}
      </button>
      <span className="text-sm text-muted-foreground">
        {followersCount} 位关注者
      </span>
    </div>
  );
}

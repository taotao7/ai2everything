"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface ShareButtonProps {
  imageId: string;
  isPublic: boolean;
}

export function ShareButton({ imageId, isPublic }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const toggleShare = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("images")
        .update({ is_public: !isPublic })
        .eq("id", imageId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error toggling share:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleShare}
      disabled={loading}
      className="text-sm font-medium text-muted-foreground hover:text-primary"
    >
      {loading ? "更新中..." : isPublic ? "取消分享" : "分享"}
    </button>
  );
}

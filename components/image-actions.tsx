"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface ImageActionsProps {
  imageId: string;
  userId: string;
  currentUserId: string | undefined;
}

export function ImageActions({
  imageId,
  userId,
  currentUserId,
}: ImageActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // 检查是否是图片所有者
  const isOwner = currentUserId === userId;

  if (!isOwner) {
    return null;
  }

  const handleDelete = async () => {
    if (!window.confirm("确定要删除这张图片吗？")) {
      return;
    }

    try {
      setLoading(true);

      // 删除图片
      const { error } = await supabase
        .from("images")
        .delete()
        .eq("id", imageId)
        .eq("user_id", currentUserId);

      if (error) throw error;

      // 如果在图片详情页，返回上一页
      if (window.location.pathname.startsWith("/images/")) {
        router.back();
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-sm font-medium text-destructive hover:text-destructive/90"
      >
        {loading ? "删除中..." : "删除"}
      </button>
    </div>
  );
}

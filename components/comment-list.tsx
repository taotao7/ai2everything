"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
  };
}

interface CommentListProps {
  imageId: string;
}

export function CommentList({ imageId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await supabase
          .from("comments")
          .select("*, profiles(username)")
          .eq("image_id", imageId)
          .order("created_at", { ascending: false });

        setComments(data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // 订阅新评论
    const channel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `image_id=eq.${imageId}`,
        },
        (payload) => {
          setComments((current) => [payload.new as Comment, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [imageId, supabase]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">加载评论中...</div>;
  }

  if (!comments.length) {
    return <div className="text-sm text-muted-foreground">暂无评论</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {comment.profiles.username || "匿名用户"}
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}

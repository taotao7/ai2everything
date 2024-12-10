"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialData: {
    username: string | null;
    bio: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [username, setUsername] = useState(initialData.username || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("未登录");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: username || null,
          bio: bio || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新资料失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium leading-none">
          用户名
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="输入您的用户名"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium leading-none">
          个人简介
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="介绍一下自己..."
        />
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium"
        disabled={loading}
      >
        {loading ? "保存中..." : "保存"}
      </button>
    </form>
  );
}

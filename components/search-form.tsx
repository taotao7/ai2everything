"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const styles = [
  { id: "all", name: "所有风格" },
  { id: "realistic", name: "写实风格" },
  { id: "anime", name: "动漫风格" },
  { id: "artistic", name: "艺术风格" },
  { id: "3d", name: "3D渲染" },
];

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [style, setStyle] = useState(searchParams.get("style") || "all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (style !== "all") params.set("style", style);
    router.push(`/explore${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索图片描述..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {styles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
        >
          搜索
        </button>
      </div>
    </form>
  );
}

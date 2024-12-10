"use client";

import { useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { id: "latest", name: "最新发布" },
  { id: "popular", name: "最受欢迎" },
];

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "latest";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleChange(e.target.value)}
      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
    >
      {sortOptions.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

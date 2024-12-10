import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: images } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">欢迎回来</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/create"
          className="flex h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center hover:bg-muted"
        >
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">创建新图片</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              使用AI生成独特的图片
            </p>
          </div>
        </Link>
        {images?.map((image) => (
          <div
            key={image.id}
            className="flex flex-col justify-between rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                {image.prompt}
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

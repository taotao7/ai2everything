import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ImageCard } from "@/components/image-card";
import { LoadingCard } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";

async function ExploreGrid() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 先获取所有公开图片
  const { data: images, error: imagesError } = await supabase
    .from("images")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  console.log("Public images query result:", { images, imagesError });

  if (imagesError) {
    console.error("Error fetching public images:", imagesError);
    throw imagesError;
  }

  if (!images?.length) {
    // 让我们检查一下是否有任何图片
    const { data: totalCount } = await supabase
      .from("images")
      .select("id", { count: "exact" });

    console.log("Total images in database:", totalCount?.length);

    // 检查是否有任何公开图片
    const { data: publicCount } = await supabase
      .from("images")
      .select("id")
      .eq("is_public", true);

    console.log("Total public images:", publicCount?.length);

    return (
      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          还没有公开的图片 (总图片数: {totalCount?.length}, 公开图片数:{" "}
          {publicCount?.length})
        </p>
      </div>
    );
  }

  // 获取所有相关用户的资料
  const userIds = [...new Set(images.map((img) => img.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds);

  console.log("User profiles:", profiles);

  // 将用户资料映射到图片数据中
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
  const imagesWithProfiles = images.map((image) => ({
    ...image,
    profiles: profileMap.get(image.user_id) || null,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {imagesWithProfiles.map((image) => (
        <ImageCard
          key={image.id}
          id={image.id}
          url={image.url}
          prompt={image.prompt}
          style={image.style}
          createdAt={image.created_at}
          likesCount={image.likes_count}
          isPublic={image.is_public}
          username={image.profiles?.username ?? undefined}
          userId={image.user_id}
          currentUserId={user?.id}
        />
      ))}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">发现</h2>
      </div>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          }
        >
          <ExploreGrid />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ImageCard } from "@/components/image-card";
import { LoadingCard } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";

async function GalleryGrid() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  if (!images?.length) {
    return (
      <div className="text-center">
        <p className="text-lg text-muted-foreground">还没有创建任何图片</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          id={image.id}
          url={image.url}
          prompt={image.prompt}
          style={image.style}
          createdAt={image.created_at}
          likesCount={image.likes_count}
          isPublic={image.is_public}
          userId={image.user_id}
          currentUserId={user.id}
        />
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">我的图库</h2>
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
          <GalleryGrid />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

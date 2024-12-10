import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { ImageCard } from "@/components/image-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";

async function ProfileContent() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">个人资料</h2>
        <div className="max-w-lg">
          <ProfileForm
            initialData={{
              username: profile?.username,
              bio: profile?.bio,
            }}
          />
        </div>
      </div>

      {images?.length ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">公开作品</h2>
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
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <ProfileContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

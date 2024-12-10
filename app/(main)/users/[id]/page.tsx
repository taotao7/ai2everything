import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageCard } from "@/components/image-card";
import { FollowButton } from "@/components/follow-button";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";
import type { Image, Profile } from "@/types/database";

interface UserProfilePageProps {
  params: {
    id: string;
  };
}

async function UserProfileContent({ userId }: { userId: string }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()) as { data: Profile | null };

  if (!profile) {
    notFound();
  }

  const { data: images } = (await supabase
    .from("images")
    .select("*")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false })) as { data: Image[] | null };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {profile.username || "未设置用户名"}
            </h2>
            {profile.bio && (
              <p className="text-muted-foreground mt-2">{profile.bio}</p>
            )}
          </div>
          {currentUser?.id !== userId && (
            <FollowButton
              userId={userId}
              initialFollowersCount={profile.followers_count}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link
            href={`/users/${userId}/followers`}
            className="hover:text-foreground transition-colors"
          >
            {profile.followers_count} 位关注者
          </Link>
          <Link
            href={`/users/${userId}/following`}
            className="hover:text-foreground transition-colors"
          >
            {profile.following_count} 位正在关注
          </Link>
          <span>{images?.length || 0} 个作品</span>
        </div>
      </div>

      {images?.length ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">公开作品</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                username={profile.username || undefined}
                userId={userId}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">暂无公开作品</p>
      )}
    </div>
  );
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <UserProfileContent userId={params.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

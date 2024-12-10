import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FollowButton } from "@/components/follow-button";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";
import type { Follow } from "@/types/database";

interface FollowingPageProps {
  params: {
    id: string;
  };
}

async function FollowingContent({ userId }: { userId: string }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: following } = (await supabase
    .from("follows")
    .select("following_id, profiles!follows_following_id_fkey(*)")
    .eq("follower_id", userId)) as { data: Follow[] | null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {profile.username || "未设置用户名"}正在关注
        </h2>
      </div>

      <div className="divide-y">
        {following?.map((follow) => (
          <div
            key={follow.following_id}
            className="flex items-center justify-between py-4"
          >
            <Link
              href={`/users/${follow.following_id}`}
              className="flex items-center gap-4"
            >
              <div>
                <p className="font-medium">
                  {follow.profiles.username || "未设置用户名"}
                </p>
                {follow.profiles.bio && (
                  <p className="text-sm text-muted-foreground">
                    {follow.profiles.bio}
                  </p>
                )}
              </div>
            </Link>
            {currentUser?.id !== follow.following_id && (
              <FollowButton
                userId={follow.following_id}
                initialFollowersCount={follow.profiles.followers_count}
              />
            )}
          </div>
        ))}
        {!following?.length && (
          <p className="py-4 text-center text-muted-foreground">
            暂未关注任何人
          </p>
        )}
      </div>
    </div>
  );
}

export default function FollowingPage({ params }: FollowingPageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <FollowingContent userId={params.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

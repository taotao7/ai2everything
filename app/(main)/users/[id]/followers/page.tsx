import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FollowButton } from "@/components/follow-button";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";
import type { Follow } from "@/types/database";

interface FollowersPageProps {
  params: {
    id: string;
  };
}

async function FollowersContent({ userId }: { userId: string }) {
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

  const { data: followers } = (await supabase
    .from("follows")
    .select("follower_id, profiles!follows_follower_id_fkey(*)")
    .eq("following_id", userId)) as { data: Follow[] | null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {profile.username || "未设置用户名"}的关注者
        </h2>
      </div>

      <div className="divide-y">
        {followers?.map((follow) => (
          <div
            key={follow.follower_id}
            className="flex items-center justify-between py-4"
          >
            <Link
              href={`/users/${follow.follower_id}`}
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
            {currentUser?.id !== follow.follower_id && (
              <FollowButton
                userId={follow.follower_id}
                initialFollowersCount={follow.profiles.followers_count}
              />
            )}
          </div>
        ))}
        {!followers?.length && (
          <p className="py-4 text-center text-muted-foreground">暂无关注者</p>
        )}
      </div>
    </div>
  );
}

export default function FollowersPage({ params }: FollowersPageProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ErrorBoundary>
        <Suspense fallback={<LoadingPage />}>
          <FollowersContent userId={params.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

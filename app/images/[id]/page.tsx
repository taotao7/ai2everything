import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ImageCard } from "@/components/image-card";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { Metadata } from "next";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Image } from "@/types/database";

interface ImageWithProfile extends Image {
  profiles: {
    username: string | null;
  } | null;
}

export async function generateStaticParams() {
  return [];
}

async function getImage(
  supabase: SupabaseClient,
  id: string,
  retryCount = 0
): Promise<ImageWithProfile | null> {
  try {
    console.log(`Fetching image with ID: ${id} (attempt ${retryCount + 1})`);
    const { data: image, error: imageError } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .single();

    if (imageError) {
      console.error(
        `Error fetching image (attempt ${retryCount + 1}):`,
        imageError
      );
      if (retryCount < 2) {
        console.log(`Retrying... (${retryCount + 1}/2)`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return getImage(supabase, id, retryCount + 1);
      }
      return null;
    }

    if (!image) {
      console.log("No image found");
      return null;
    }

    // 获取用户资料
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", image.user_id)
      .single();

    return {
      ...image,
      profiles: profile,
    };
  } catch (error) {
    console.error(
      `Unexpected error in getImage (attempt ${retryCount + 1}):`,
      error
    );
    if (retryCount < 2) {
      console.log(`Retrying... (${retryCount + 1}/2)`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );
      return getImage(supabase, id, retryCount + 1);
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    const image = await getImage(supabase, params.id);

    return {
      title: image ? `${image.prompt} - AI2Everything` : "图片 - AI2Everything",
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: "图片 - AI2Everything",
    };
  }
}

export default async function ImagePage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const image = await getImage(supabase, params.id);

    if (!image) {
      console.log("Image not found or error occurred, redirecting to 404");
      notFound();
    }

    return (
      <div className="container py-8">
        <div className="space-y-8">
          <div className="max-w-3xl mx-auto">
            <ImageCard
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
          </div>
          {user && (
            <div className="max-w-3xl mx-auto space-y-4">
              <CommentForm imageId={params.id} />
              <CommentList imageId={params.id} />
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ImagePage:", error);
    notFound();
  }
}

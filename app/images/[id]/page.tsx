import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ImageCard } from "@/components/image-card";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { Metadata } from "next";

interface ImagePageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return [];
}

async function getImage(id: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data: image } = await supabase
    .from("images")
    .select("*, profiles(username)")
    .eq("id", id)
    .single();

  return image;
}

export async function generateMetadata({
  params,
}: ImagePageProps): Promise<Metadata> {
  const image = await getImage(params.id);

  return {
    title: image ? `${image.prompt} - AI2Everything` : "图片 - AI2Everything",
  };
}

export default async function ImagePage({ params }: ImagePageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const image = await getImage(params.id);

  if (!image) {
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
            username={image.profiles?.username}
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
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { ShareButton } from "@/components/share-button";
import { ImageActions } from "@/components/image-actions";
import { SocialShare } from "@/components/social-share";
import { DownloadButton } from "@/components/download-button";

interface ImageCardProps {
  id: string;
  url: string;
  prompt: string;
  style: string;
  createdAt: string;
  likesCount: number;
  isPublic: boolean;
  username?: string;
  userId?: string;
  currentUserId?: string;
  showActions?: boolean;
}

export function ImageCard({
  id,
  url,
  prompt,
  style,
  createdAt,
  likesCount,
  isPublic,
  username,
  userId,
  currentUserId,
  showActions = true,
}: ImageCardProps) {
  return (
    <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      <Link href={`/images/${id}`} className="relative aspect-square">
        <Image
          src={url}
          alt={prompt}
          fill
          className="object-cover rounded-t-lg transition-transform hover:scale-105"
        />
      </Link>
      <div className="p-4 space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </span>
          <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full">
            {style}
          </span>
        </div>
        {showActions && (
          <div className="flex flex-wrap gap-4 justify-between items-center pt-2">
            <div className="flex items-center gap-4">
              <LikeButton imageId={id} initialLikesCount={likesCount} />
              {userId && currentUserId && (
                <ImageActions
                  imageId={id}
                  userId={userId}
                  currentUserId={currentUserId}
                />
              )}
            </div>
            <div className="flex items-center gap-4">
              {username && userId ? (
                <Link
                  href={`/users/${userId}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  by {username}
                </Link>
              ) : (
                <ShareButton imageId={id} isPublic={isPublic} />
              )}
              <div className="flex items-center gap-2">
                <SocialShare
                  url={`/images/${id}`}
                  title={`查看这张AI生成的图片：${prompt}`}
                />
                <DownloadButton url={url} filename={`ai2everything-${id}`} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

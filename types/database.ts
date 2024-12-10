export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  followers_count: number;
  following_count: number;
}

export interface Image {
  id: string;
  created_at: string;
  user_id: string;
  prompt: string;
  style: string;
  url: string;
  is_public: boolean;
  likes_count: number;
}

export interface Follow {
  id: string;
  created_at: string;
  follower_id: string;
  following_id: string;
  profiles: Profile;
}

export interface Like {
  id: string;
  created_at: string;
  user_id: string;
  image_id: string;
}

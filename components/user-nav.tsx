"use client";

import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium leading-none">{user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm font-medium text-muted-foreground hover:text-primary"
      >
        退出登录
      </button>
    </div>
  );
}

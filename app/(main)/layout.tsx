import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 只有访问 dashboard 路径时才需要登录
  const pathname = new URL(
    (await cookieStore).get("next-url")?.value || "/",
    "http://localhost"
  ).pathname;
  if (!user && pathname.startsWith("/dashboard")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          {user ? <UserNav user={user} /> : null}
        </div>
      </header>
      <main className="container flex w-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

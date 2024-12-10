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

  // 获取当前路径
  const pathname = new URL(
    (await cookieStore).get("next-url")?.value || "/",
    "http://localhost"
  ).pathname;

  // 如果用户未登录且访问需要认证的路径，重定向到登录页
  if (!user && pathname.startsWith("/dashboard")) {
    redirect("/login");
  }

  // 如果用户已登录且访问登录/注册页，重定向到仪表板
  if (user && (pathname === "/login" || pathname === "/register")) {
    redirect("/dashboard");
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

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          欢迎来到 AI2Everything
        </h1>
        <p className="text-xl mb-8 text-center">一个基于AI的图片生成社区平台</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2 bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            注册
          </Link>
        </div>
      </div>
    </div>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [{ hostname: "uppfvdzazkbvkhdnrqoh.supabase.co" }],
  },
};

export default nextConfig;

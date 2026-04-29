import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: [
    "*.vercel.app",
    "*.now.sh",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

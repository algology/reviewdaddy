import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["google-play-scraper"],
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["app/", "components/", "lib/", "types/"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

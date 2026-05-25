import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tmpfiles.org" },
      { protocol: "https", hostname: "fal.media" },
    ],
  },
  serverExternalPackages: [],
};

export default nextConfig;

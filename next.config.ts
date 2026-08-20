import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow external images if you add room photos later
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

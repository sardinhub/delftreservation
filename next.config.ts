import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: Do NOT use output: "standalone" on Vercel — it has its own serverless format
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-libsql",
    "@libsql/client",
    "bcryptjs",
  ],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

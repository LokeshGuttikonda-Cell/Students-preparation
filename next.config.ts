import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright drives the dev server over 127.0.0.1 while Next.js serves on
  // localhost; without this, Next warns on every /_next/* request.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

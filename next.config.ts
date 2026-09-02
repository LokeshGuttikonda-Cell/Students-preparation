import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright drives the dev server over 127.0.0.1 while Next.js serves on
  // localhost; without this, Next warns on every /_next/* request.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  typedRoutes: true,
};

export default nextConfig;

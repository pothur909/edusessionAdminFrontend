import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_URL: `http://localhost:6969`,
  },
    eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    domains: ["images.pexels.com"],
  },
};


export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  // Strict memory and sequentially compile routes
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;

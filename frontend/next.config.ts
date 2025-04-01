import type { NextConfig } from "./node_modules/next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/create',
      },
    ]
  }
};

module.exports = nextConfig;

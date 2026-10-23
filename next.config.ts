import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network and loopback hosts to avoid Next.js HMR WebSocket blocking
  allowedDevOrigins: ["localhost", "127.0.0.1", "172.30.16.1"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

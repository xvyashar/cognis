import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Next rejects bare "*" / "**" patterns, so match any IPv4 host and any
  // two-label hostname (e.g. a `.local` name) instead of pinning this machine.
  allowedDevOrigins: ["*.*.*.*", "*.*"],
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

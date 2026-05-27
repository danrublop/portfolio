import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. A stray lockfile one level up (~/package-lock.json)
  // otherwise makes Turbopack infer the wrong root and emit a warning on every build.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Serve AVIF first (smallest), fall back to WebP, then the original.
    // next/image negotiates per request via the Accept header.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

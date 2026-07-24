import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats from next/image — AVIF first, WebP fallback. Cuts
    // image bytes substantially versus the source PNG/JPG.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

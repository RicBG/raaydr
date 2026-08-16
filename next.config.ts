import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Native View Transitions for route changes. The browser owns the
    // animation, so this adds no animation library and no runtime work of our
    // own; where the API is unsupported navigation simply does not animate.
    viewTransition: true,
  },
  images: {
    // Serve modern formats from next/image — AVIF first, WebP fallback. Cuts
    // image bytes substantially versus the source PNG/JPG.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

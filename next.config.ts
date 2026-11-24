import type { NextConfig } from "next";

/**
 * The four response headers every page carries (board rows 6606, 6610, 6618:
 * Raph's sweep proved app.raaydr.com could be put in somebody else's iframe,
 * and raaydr.com sent none of these either).
 *
 * `frame-ancestors 'none'` is the modern frame ban and `X-Frame-Options: DENY`
 * is the same ban for a browser that predates it, so both ship. Neither is a
 * full Content-Security-Policy: that was ruled out on row 6610 ("don't do a
 * full CSP"), because a half-measured policy breaks a page in ways nothing
 * here would notice before a visitor did.
 *
 * Exported so `lib/security-headers.test.ts` can read them without starting a
 * server. A header nobody asserts is one a later edit removes in silence.
 */
export const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // `experimental.viewTransition` is gone: Next 16.3.0 removed the flag as
  // inert and its docs now say view transitions need no configuration.
  // components/RouteTransition.tsx is still what puts a <ViewTransition> in
  // the tree.
  images: {
    // Serve modern formats from next/image — AVIF first, WebP fallback. Cuts
    // image bytes substantially versus the source PNG/JPG.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

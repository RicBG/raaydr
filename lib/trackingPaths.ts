import type { Metadata } from "next";

// Short paths for links we post on our own social accounts. Each one renders
// the homepage at its own address, so Vercel Web Analytics counts the visit
// under that path and attribution records it as the landing_path, both free.
// A redirect would not do this: the analytics script runs in the browser and
// only ever sees the page it lands on, which would be "/". Row 3212.
//
// Adding one is a new folder under app/ with the same two lines as app/tt, and
// an entry here; trackingPaths.test.ts fails if the two lists disagree.
export const TRACKING_PATHS = {
  "/tt": "TikTok bio",
  "/ig": "Instagram bio",
  "/th": "Threads",
  "/fb": "Facebook",
  "/dm": "Reel comment for link DMs",
  "/li": "LinkedIn, Ric's posts and the RAAYDR page",
  "/em": "Email sends",
} as const;

export type TrackingPath = keyof typeof TRACKING_PATHS;

/** True on "/" and on every short path, which are the homepage too. */
export function isHomePath(pathname: string | null): boolean {
  return pathname === "/" || (pathname !== null && Object.hasOwn(TRACKING_PATHS, pathname));
}

/**
 * Inherits everything else from the root layout, whose canonical and og:url
 * already point at "/". Kept out of search so the homepage never competes with
 * copies of itself; links are still followed.
 */
export const trackingPathMetadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

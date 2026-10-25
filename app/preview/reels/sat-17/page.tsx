import type { Metadata } from "next";
import ReelPreview from "@/components/reels/ReelPreview";
import { SAT_17_REEL } from "@/lib/reels/sat-17";

/**
 * /preview/reels/sat-17: the Sat 17 Oct reel, playable in a browser before it is
 * rendered. Ric signs off here; the MP4 is made only after that (board row 3539).
 *
 * Out of the index on every axis: robots noindex, no canonical, not in
 * app/sitemap.ts (which is an explicit list, so nothing under /preview can leak
 * into it by accident). It is a working surface, not a page of the site.
 */
export const metadata: Metadata = {
  title: `Reel preview: ${SAT_17_REEL.day}`,
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return <ReelPreview />;
}

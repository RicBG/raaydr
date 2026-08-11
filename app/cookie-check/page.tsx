import type { Metadata } from "next";
import CookieCheck from "@/components/CookieCheck";

/**
 * Temporary cookie verification page.
 *
 * Exists because consent gating is proven in code and in a headless browser but
 * has never been watched against the real Google and Meta libraries: the build
 * environment cannot reach either host. This gives a phone a readout, so the
 * behaviour can be checked where the tags actually load.
 *
 * Delete once the check is signed off. Nothing links to it.
 *
 * This wrapper is a Server Component purely because `metadata` is a server
 * export and the noindex below is not optional: an unlinked diagnostic page
 * that leaks the site's cookie names into a search index is worse than no page.
 * The readout itself is the Client Component it renders.
 *
 * It is deliberately absent from app/sitemap.ts, which is an explicit list
 * rather than a filesystem scrape, so no change was needed there.
 */
export const metadata: Metadata = {
  title: "Cookie check",
  // Renders <meta name="robots" content="noindex, nofollow">.
  robots: { index: false, follow: false },
};

export default function CookieCheckPage() {
  return <CookieCheck />;
}

import type { Metadata } from "next";

/**
 * Per-page metadata helper.
 *
 * App Router metadata merges *shallowly*: a page that sets `openGraph` replaces
 * the root layout's block wholesale rather than merging into it. That is why
 * every page has to restate siteName, type and images — and why, before this
 * helper existed, no page set openGraph at all and the whole site inherited the
 * homepage's og:url.
 *
 * URLs are relative on purpose. `metadataBase` in the root layout resolves them
 * against the canonical apex origin, so the host lives in exactly one place.
 */

export const SITE_NAME = "RAAYDR";

export const SITE_DESCRIPTION =
  "Your money follows the artists you actually listen to. Producers and songwriters get paid automatically. The people who find music first earn for their taste. Traceable, every month.";

const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: SITE_NAME };

type PageMetadata = {
  title: string;
  /** Falls back to the site description — used by the legal pages. */
  description?: string;
  /** Root-relative path for this page, e.g. "/artists". */
  path: string;
};

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
}: PageMetadata): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

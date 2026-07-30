import type { Metadata } from "next";
import { SITE_URL } from "./site";

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

/**
 * Site-wide entity markup, emitted once from the root layout.
 *
 * Per-page FAQPage blocks describe what a page answers; nothing described the
 * thing answering. These two give search and answer engines an entity to anchor
 * "what is RAAYDR" to. The Pulse posts' own BlogPosting and FAQPage blocks are
 * unaffected — they sit alongside these, not inside them.
 */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** Mirrors the profile links in the nav, footer and About page. */
const SOCIAL_PROFILES = [
  "https://instagram.com/raaydrmusic",
  "https://tiktok.com/@raaydrmusic",
];

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo/raaydr-avatar-light.png`,
    width: 1024,
    height: 1024,
  },
  sameAs: SOCIAL_PROFILES,
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "en-GB",
  publisher: { "@id": ORGANIZATION_ID },
};

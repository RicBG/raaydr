/**
 * The canonical origin for the marketing site.
 *
 * The apex is canonical, not www: robots.txt declares this host, every
 * sitemap entry uses it, and every canonical/og:url resolves from it. The
 * www → apex redirect is handled at the domain level in Vercel, so there is
 * deliberately no redirect in next.config — a second one risks a loop.
 *
 * Anything that needs an absolute URL reads it from here. Do not hardcode a
 * host anywhere else, and never introduce a www variant.
 */
export const SITE_URL = "https://raaydr.com";

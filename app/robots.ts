import type { MetadataRoute } from "next";

const SITE = "https://raaydr.com";

// The site has no prior robots policy, so everything stays crawlable
// (including AI crawlers such as GPTBot, ClaudeBot and PerplexityBot, which
// fall under "*"). This only adds the sitemap reference; it neither tightens
// nor loosens access for any existing route.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}

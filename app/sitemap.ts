import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/pulse";
import { SITE_URL } from "@/lib/site";

// Static routes that exist under app/. Kept explicit so the sitemap stays a
// deliberate list rather than a filesystem scrape.
const STATIC_ROUTES = [
  "/",
  "/about",
  "/artists",
  "/producers-songwriters",
  "/tastemakers",
  "/for-listeners",
  "/privacy",
  "/terms",
  "/website-terms",
  "/cookies",
  "/help",
  "/pulse",
  "/tools/streaming-royalty-calculator",
];

// Fixed on purpose. A sitemap that stamps every page with the build time tells
// search engines everything changed on every deploy, and they learn to ignore
// the field (row 3263, technical win 5). This date moves only when someone
// edits it. The checkout this was written in has no git history to read a real
// per page date from, so one honest date stands for the static pages; split it
// per route when there is a source for each.
const STATIC_LAST_MODIFIED = "2026-10-15";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: route === "/pulse" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/pulse/${post.slug}`,
    lastModified: post.dateUpdated || post.datePublished,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}

import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/pulse";

const SITE = "https://raaydr.com";

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
  "/pulse",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE}${route}`,
    lastModified: now,
    changeFrequency: route === "/pulse" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE}/pulse/${post.slug}`,
    lastModified: post.dateUpdated || post.datePublished,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}

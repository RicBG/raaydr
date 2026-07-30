import type { Metadata } from "next";
import AboutContent from "@/components/AboutContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About RAAYDR: Built for the culture. Owned by the community.",
  description:
    "RAAYDR is an independent music streaming platform that pays the artists you actually listen to.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutContent />;
}

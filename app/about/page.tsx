import type { Metadata } from "next";
import AboutContent from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "About RAAYDR — Built for the culture. Owned by the community.",
  description:
    "RAAYDR is an independent music streaming platform that pays the artists you actually listen to.",
};

export default function AboutPage() {
  return <AboutContent />;
}

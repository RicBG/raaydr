import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { readLegal } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

/*
 * Published verbatim from content/legal/cookies.md, the text Ric approved on
 * 3 October 2026 (board rows 2558 and 2559, corrected per rows 2570 and 2571).
 * Change the words there, never here.
 */
export const metadata: Metadata = pageMetadata({
  title: "Cookie policy: RAAYDR",
  description: "The cookies raaydr.com uses and how to change your choice.",
  path: "/cookies",
});

export default function Page() {
  return <LegalDocument doc={readLegal("cookies")} current="/cookies" audience="artists" />;
}

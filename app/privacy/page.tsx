import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { readLegal } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

/*
 * Published verbatim from content/legal/privacy.md, the text Ric approved on
 * 3 October 2026 (board rows 2558 and 2559, corrected per rows 2570 and 2571).
 * Change the words there, never here.
 */
export const metadata: Metadata = pageMetadata({
  title: "Privacy policy: RAAYDR",
  description: "What personal data RAAYDR collects, why, who sees it, and your rights.",
  path: "/privacy",
});

export default function Page() {
  return <LegalDocument doc={readLegal("privacy")} current="/privacy" audience="tastemakers" />;
}

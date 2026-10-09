import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { readLegal } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

/*
 * Published verbatim from content/legal/website-terms.md, the text Ric approved on
 * 3 October 2026 (board rows 2558 and 2559, corrected per rows 2570 and 2571).
 * Change the words there, never here.
 */
export const metadata: Metadata = pageMetadata({
  title: "Website terms: RAAYDR",
  description: "The terms for visiting raaydr.com.",
  path: "/website-terms",
});

export default function Page() {
  return <LegalDocument doc={readLegal("website-terms")} current="/website-terms" audience="listeners" />;
}

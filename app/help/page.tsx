import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";
import { readHelp } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

/*
 * The support page. Ric, board row 3902 ruling 5: "a page on raaydr.com, with the in-app Help
 * screen pointing at it and carrying a support email underneath", and App Store Connect needs a
 * support URL, so this is the one page for both. The words are in content/help.md.
 */
export const metadata: Metadata = pageMetadata({
  title: "Help: RAAYDR",
  description: "Get help with RAAYDR: signing in, your account, and how to reach us.",
  path: "/help",
});

export default function Page() {
  return <LegalDocument doc={readHelp()} current="/help" audience="listeners" eyebrow="Help" showLegalLinks={false} />;
}

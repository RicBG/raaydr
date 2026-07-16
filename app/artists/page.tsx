import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";
import Calculator from "@/components/sections/Calculator";

export const metadata: Metadata = {
  title: "RAAYDR for Artists — Get paid for the people who actually listen.",
  description:
    "On RAAYDR your income comes from your fans' subscriptions, not a global pool. Automatic splits for everyone who made the record.",
};

export default function ArtistsPage() {
  return (
    <AudiencePage
      eyebrow="For artists"
      title="Get paid for the people who actually listen."
      lead="On RAAYDR your income comes from your fans' subscriptions, not a global pool. £3.50 of every fan's month follows their listening — and the share that lands on your music lands with you. Automatic splits for everyone who made the record."
      color="#EBA83A"
      halo="artists"
      role="Artist"
      calculator={<Calculator disclaimer />}
      points={[
        {
          title: "No label required.",
          body: "Upload directly. No gatekeeper to pass, no distributor taking a cut of a cut.",
        },
        {
          title: "Splits built in.",
          body: "Producers, songwriters and features are credited and paid automatically, the moment your work plays.",
        },
        {
          title: "Traceable, monthly.",
          body: "See exactly which fans' money reached you. Every month. Line by line.",
        },
      ]}
    />
  );
}

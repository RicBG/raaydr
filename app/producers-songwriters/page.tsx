import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";
import SplitCalculator from "@/components/sections/SplitCalculator";

export const metadata: Metadata = {
  title:
    "RAAYDR for Producers & Songwriters — Credited, found, and paid the moment your work plays.",
  description:
    "The split is built in, not begged for. When a record you helped make earns, your share arrives automatically.",
};

export default function ProducersSongwritersPage() {
  return (
    <AudiencePage
      eyebrow="For producers & songwriters"
      title="Credited, found, and paid the moment your work plays."
      lead="The split is built in, not begged for. When a record you helped make earns, your share arrives automatically, with your name on the work everywhere it travels."
      color="#8C7AE6"
      halo="producers"
      role="Songwriter or Producer"
      calculator={<SplitCalculator />}
      points={[
        {
          title: "Credit is infrastructure.",
          body: "Your credits live on the record itself. Listeners can find everything you've touched.",
        },
        {
          title: "Paid at the source.",
          body: "Your percentage is applied before money moves, not negotiated after.",
        },
        {
          title: "Found by your work.",
          body: "When a track travels, everyone on it travels too.",
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";
import SplitCalculator from "@/components/sections/SplitCalculator";
import { faqData } from "@/lib/faqData";

export const metadata: Metadata = {
  title:
    "RAAYDR for Producers & Songwriters: Credited, found, and paid the moment your work plays.",
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
      waitlistSource="producers-page"
      faqItems={faqData.producersSongwriters}
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
      heroCallout={{
        heading: "We tell you when you're owed something.",
        body: "Get credited on a track, and the moment it starts earning, we let you know. No chasing the artist. No waiting on a statement six months late. Your money finds you.",
      }}
      tintSections={[
        {
          heading: "RAAYDR+",
          body: "The first 100 producers and songwriters get it free, forever. Everyone after pays £3.99 a month. Your whole catalogue in one place, across every artist you work with, with your split tracked on every song. We are building toward paying your share directly from source, so you never have to ask an artist for money again.",
        },
        {
          body: "Coming soon: claim your credit. Helped make a track that's already up under someone else's upload? You'll be able to flag it, agree the split with the artist, and start earning from it.",
        },
        {
          heading: "See exactly who's playing your work.",
          body: "Which artists' tracks you're featured on are getting the most love. Which of your songs actually connects, and with who. Real numbers, not a credit buried in metadata nobody reads.",
        },
      ]}
    />
  );
}

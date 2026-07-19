import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";
import Calculator from "@/components/sections/Calculator";
import { faqData } from "@/lib/faqData";

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
      lead="On RAAYDR your income comes from your fans' subscriptions, not a global pool. £3.50 of every fan's month follows their listening, and the share that lands on your music lands with you. Automatic splits for everyone who made the record."
      color="#EBA83A"
      halo="artists"
      role="Artist"
      waitlistSource="artists-page"
      faqItems={faqData.artists}
      calculator={<Calculator disclaimer />}
      beat={{
        heading: "You didn't sign up to be a content creator.",
        body: [
          "Post more. Dance more. Do TikTok. Do Instagram. Everything except make music. Because making music stopped paying.",
          "RAAYDR pays for the music. Not the marketing.",
        ],
      }}
      points={[
        {
          title: "No label required.",
          body: "Upload directly. No gatekeeper to pass, no distributor taking a cut of a cut. Your masters, your publishing, all of it stays yours.",
        },
        {
          title: "Splits built in.",
          body: "Producers, songwriters and features are credited and paid automatically, the moment your work plays. Set the split when you upload the track. Every month, your share and theirs move at the same time, automatically. No invoices, no chasing.",
        },
        {
          title: "Traceable, monthly.",
          body: "See exactly which fans' money reached you. Every month. Line by line.",
        },
      ]}
      heroCallout={{
        heading: "Your most loyal fans deserve more than a stream count.",
        body: "Early access to new tracks. Discounts on merch and tickets. A personal thank you when someone's actually shown up for you. You set what unlocks and at what point. It's not a loyalty scheme bolted on after the fact. It's built into how RAAYDR works.",
      }}
      tintSections={[
        {
          body: "Coming soon: live studio drop-ins. We're building a way for your most loyal fans to sit in on sessions as they happen.",
        },
      ]}
    />
  );
}

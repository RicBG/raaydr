import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";
import TastemakerCalculator from "@/components/sections/TastemakerCalculator";
import { faqData } from "@/lib/faqData";

export const metadata: Metadata = {
  title: "RAAYDR for Tastemakers: Back music early. Earn for your taste.",
  description:
    "Up to 15% of every subscription is ring fenced for the people who find music first. Be early and right, and the fund pays you for it.",
};

export default function TastemakersPage() {
  return (
    <AudiencePage
      eyebrow="For tastemakers"
      title="Back music early. Earn for your taste."
      lead="Up to 15% of every subscription is ring fenced for the people who find music first. Whatever is not earned goes to the artists. Surface what's worth hearing, be early and right, and the fund pays you for it."
      color="#E585AC"
      halo="tastemakers"
      role="Tastemaker"
      waitlistSource="tastemakers-page"
      faqItems={faqData.tastemakers}
      calculator={<TastemakerCalculator />}
      heroCallout={{
        heading: "No one can buy their way onto your list.",
        body: "Tastemakers rise because people rate their picks, not because someone paid for placement. Every pick public, every track record visible. Your name means something here.",
      }}
      tintSections={[
        {
          heading: "RAAYDR+",
          body: "The first 25 tastemakers get it free, forever. Everyone after pays £3.99 a month. Proof you broke it. Every artist you put in front of people, how many stayed, and what you delivered to that artist in pounds. A record of your taste that nobody can fake.",
        },
        {
          heading: "Nothing comes back to us.",
          body: "Any part of the tastemaker fund nobody earns goes to the artists. It never comes back to us.",
        },
        {
          heading: "25 seats.",
          body: "Every seat we add divides the same fund, so we are not adding many.",
        },
      ]}
      pointsNote="Not follower counts. Not industry connections. Ears."
      closing="You've done this for free your whole life. Time to do it somewhere that pays."
      points={[
        {
          title: "A ringfenced fund.",
          body: "The tastemaker fund is carved out before anything else. It exists only to reward taste.",
        },
        {
          title: "Reputation that compounds.",
          body: "Every early call you get right builds a track record everyone can see.",
        },
        {
          title: "Real influence.",
          body: "No playlist payola. Your picks rise because people rate them.",
        },
      ]}
    />
  );
}

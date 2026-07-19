import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";
import TastemakerCalculator from "@/components/sections/TastemakerCalculator";

export const metadata: Metadata = {
  title: "RAAYDR for Tastemakers — Back music early. Earn for your taste.",
  description:
    "£0.99 of every subscription is ringfenced for the people who find music first. Be early and right, and the fund pays you for it.",
};

export default function TastemakersPage() {
  return (
    <AudiencePage
      eyebrow="For tastemakers"
      title="Back music early. Earn for your taste."
      lead="£0.99 of every subscription is ringfenced for the people who find music first. Surface what's worth hearing, be early and right, and the fund pays you for it."
      color="#E585AC"
      halo="tastemakers"
      role="Tastemaker"
      waitlistSource="tastemakers-page"
      calculator={<TastemakerCalculator />}
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

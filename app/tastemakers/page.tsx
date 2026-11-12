import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";
import ReferralCalculator from "@/components/sections/ReferralCalculator";
import TastemakerCalculator from "@/components/sections/TastemakerCalculator";
import { faqData } from "@/lib/faqData";
import { SPLIT } from "@/lib/raaydrRates";
import { pageMetadata } from "@/lib/seo";
import { applyUrl } from "@/lib/siteConfig";

export const metadata: Metadata = pageMetadata({
  title: "RAAYDR for Tastemakers: Back music early. Earn for your taste.",
  description:
    `Up to ${SPLIT.tastemakers}% of every subscription is ring fenced for the people who find music first. Be early and right, and the fund pays you for it.`,
  path: "/tastemakers",
});

export default function TastemakersPage() {
  return (
    <AudiencePage
      eyebrow="For tastemakers"
      title="Back music early. Earn for your taste."
      lead={`Up to ${SPLIT.tastemakers}% of every subscription is ring fenced for the people who find music first. Whatever is not earned goes to the artists. Surface what's worth hearing, be early and right, and the fund pays you for it.`}
      color="#E585AC"
      halo="tastemakers"
      role="Tastemaker"
      waitlistSource="tastemakers-page"
      faqItems={faqData.tastemakers}
      calculator={
        <>
          <TastemakerCalculator />
          {/* Ric, 28 October 23:14 (board rows 4268, 4272): the referral calculator lives on the
              artists page and the tastemaker page. The footnote does not promise a link until the
              code mint widens to tastemakers (work_items 403). */}
          <h2 className="display-section" style={{ marginTop: "clamp(24px, 4vw, 48px)" }}>
            And what a referral is worth.
          </h2>
          <ReferralCalculator audience="tastemaker" />
        </>
      }
      tintMarquee={{
        top: "Real influence",
        middle: "Attention pays",
        bottom: "A ringfenced fund",
        beforeCallout: true,
      }}
      heroCallout={{
        heading: "No one can buy their way onto your list.",
        body: "Tastemakers rise because people rate their picks, not because someone paid for placement. Every pick public, every track record visible. Your name means something here.",
        boldNote:
          "You've done this for free your whole life. Time to do it somewhere that pays.",
      }}
      tintSections={[
        {
          /* Ric, board rows 5347 and the 30 October ruling: 100 Day One tastemaker places.
             "Only 25 seats" was the figure before that and was still on the page. */
          heading: "100 Day One tastemaker places.",
          body: [
            "Every seat we add divides the same fund, so we are not adding many.",
            { text: "Nothing comes back to us.", bold: true },
            "Any part of the tastemaker fund nobody earns goes to the artists. It never comes back to us.",
          ],
          beforeCallout: true,
        },
        /*
          THE RAAYDR+ SECTION IS GONE. Ric, board row 5347 item 4: delete "The first 25
          tastemakers get RAAYDR+ free, forever" and anything else on this page promising
          RAAYDR+ or pay. There is no free RAAYDR+ (his 6 November ruling, row 5215).

          The whole section went rather than the one sentence, because every sentence in it was
          either that promise or the £3.99 price beside it, and what remained -- the proof and
          the track record -- this page already says under "Reputation that compounds".

          THAT REMOVES A PUBLISHED PRICE FROM THIS PAGE, which is raised on the board rather
          than decided here: if Ric wants the tastemaker RAAYDR+ price stated, it is new copy
          from Riz, and it is not this file's to invent.
        */
      ]}
      applyCta={{
        label: "Apply to join",
        href: applyUrl.tastemaker,
        note: "Tell us who you are, where you share music and what you're into. We read every application.",
      }}
      pointsNote="Not follower counts. Not industry connections. Ears."
      pledgeNote="Everything we promise artists holds for you. Your share moves monthly, from real subscriptions, on the same rails."
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

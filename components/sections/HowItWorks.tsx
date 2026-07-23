"use client";

import HowItWorksWheel, {
  type HowItWorksStep,
} from "@/components/HowItWorksWheel";
import TickerMarquee from "@/components/TickerMarquee";

// accentColor values are the project's actual --amber/--orchid/--green/--violet
// token hex (not the component's own close-but-not-exact defaults), since the
// wheel's arc/badge colour lerp parses these as literal hex, not CSS custom
// properties.
const steps: HowItWorksStep[] = [
  {
    titleLine1: "Artists",
    titleLine2: "upload.",
    description:
      "Put your music up the same way you would anywhere else. What comes with it is different: proper analytics on who is listening and where, direct contact with the people rating you, and credit splits set at upload so your producers and songwriters get paid without chasing anyone. No label. No gatekeeper. No waiting for a playlist editor to notice you.",
    accentColor: "#EBA83A", // --amber
    image: "/how-it-works/raaydr-howitworks-01-artists-submit-amber.png",
    imageAlt: "A vinyl record lit in warm amber light.",
  },
  {
    titleLine1: "Tastemakers",
    titleLine2: "curate.",
    description:
      "Tastemakers are here because of what they have already done. DJs, A&Rs, producers, journalists, playlisters, people with a track record of hearing things first. They back tracks early, build collections and put their name to artists before the rest of the platform catches up. RAAYDR is curated by people with a reputation on the line. There is no algorithm deciding what deserves your attention.",
    accentColor: "#E585AC", // --orchid
    image: "/how-it-works/raaydr-howitworks-02-tastemakers-pick-orchid.png",
    imageAlt: "A stack of records glowing in orchid pink.",
  },
  {
    titleLine1: "Listeners",
    titleLine2: "build.",
    description:
      "Rate, save, share and comment. That is what moves a track up the page, and nobody buys their way there. It also earns you points, and points unlock things worth having from the artists you back: early releases, exclusives, access. Back an artist properly and they will know exactly who you are.",
    accentColor: "#3BCE7B", // --green
    image: "/how-it-works/raaydr-howitworks-03-community-rates-green.png",
    imageAlt: "Concentric green light ripples radiating outward.",
  },
  {
    titleLine1: "The money",
    titleLine2: "moves.",
    description:
      "Artists, producers, songwriters and tastemakers get paid every month. Splits are set when the track goes up, so artist money reaches the people who made the record without anyone having to chase it. You can see where yours came from.",
    accentColor: "#8C7AE6", // --violet
    image: "/how-it-works/raaydr-howitworks-04-everyone-earns-spectrum.png",
    imageAlt: "A vinyl record shimmering across the full colour spectrum.",
  },
];

export default function HowItWorks() {
  return (
    <div id="how-it-works">
      {/* Tilted ticker bands as the heading, above the wheel. Decorative, so
          the heading is announced once by the visually hidden h2 below. */}
      <TickerMarquee
        top="Attention pays"
        middle="How It Works"
        bottom="Everyone wins"
      />
      <h2 className="sr-only">How It Works</h2>

      <HowItWorksWheel
        steps={steps}
        scrollHeightVh={350}
        showIcon
        bgColor="var(--canvas)"
        textColor="var(--ink)"
        mutedColor="color-mix(in srgb, var(--ink) 55%, transparent)"
        accentColor="var(--green)"
        tagBorderColor="var(--stone)"
        tagTextColor="var(--ink)"
        badgeBg="var(--ink)"
        ctaBg="var(--green)"
        ctaTextColor="var(--ink)"
        headingFontFamily="var(--font-display)"
        bodyFontFamily="var(--font-body)"
      />
    </div>
  );
}

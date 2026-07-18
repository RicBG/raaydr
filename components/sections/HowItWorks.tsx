"use client";

import HowItWorksWheel, {
  type HowItWorksStep,
} from "@/components/HowItWorksWheel";

// Same four steps as the site's copy elsewhere — accentColor values are the
// project's actual --amber/--orchid/--green/--violet token hex (not the
// component's own close-but-not-exact defaults), since the wheel's arc/badge
// colour lerp parses these as literal hex, not CSS custom properties.
const steps: HowItWorksStep[] = [
  {
    titleLine1: "Artists",
    titleLine2: "submit.",
    description:
      "Independent artists upload their music. No label required. No gatekeeper to pass.",
    accentColor: "#EBA83A", // --amber
    image: "/how-it-works/raaydr-howitworks-01-artists-submit-amber.png",
    imageAlt: "A vinyl record lit in warm amber light.",
  },
  {
    titleLine1: "Tastemakers",
    titleLine2: "pick.",
    description:
      "Trusted ears surface what's worth hearing first, and earn from a ringfenced fund when they're early and right.",
    accentColor: "#E585AC", // --orchid
    image: "/how-it-works/raaydr-howitworks-02-tastemakers-pick-orchid.png",
    imageAlt: "A stack of records glowing in orchid pink.",
  },
  {
    titleLine1: "Community",
    titleLine2: "rates.",
    description:
      "Listeners rate, save, share and comment. Engagement is the signal. People move the music, not a machine.",
    accentColor: "#3BCE7B", // --green
    image: "/how-it-works/raaydr-howitworks-03-community-rates-green.png",
    imageAlt: "Concentric green light ripples radiating outward.",
  },
  {
    titleLine1: "Everyone",
    titleLine2: "earns.",
    description:
      "Artists, producers, songwriters and tastemakers all get paid. Automatically. Traceably. Every month.",
    accentColor: "#8C7AE6", // --violet
    image: "/how-it-works/raaydr-howitworks-04-everyone-earns-spectrum.png",
    imageAlt: "A vinyl record shimmering across the full colour spectrum.",
  },
];

export default function HowItWorks() {
  return (
    <div id="how-it-works">
      <HowItWorksWheel
        steps={steps}
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

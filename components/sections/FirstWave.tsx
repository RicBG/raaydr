"use client";

import { useRef } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import Ring from "@/components/Ring";
import LazyOrb from "@/components/LazyOrb";
import Pulse from "@/components/Pulse";
import WaitlistForm from "@/components/WaitlistForm";
import styles from "./FirstWave.module.css";

const copy = {
  waitlist: {
    eyebrow: "Join the first wave",
    headline: `Be one of the first ${siteConfig.pricing.foundingCap.toLocaleString("en-GB")}.`,
    body: `Founding members pay £${siteConfig.pricing.founding} a month. Locked in forever. When RAAYDR opens to everyone, it goes to £${siteConfig.pricing.standard}. You were early. On RAAYDR, that counts.`,
    micro:
      "No payment required to join the waitlist. We'll let you know when founding spots open.",
  },
  live: {
    eyebrow: "Membership",
    headline: "The first wave is live.",
    body: `Membership is £${siteConfig.pricing.standard} a month. Your money follows the artists you actually listen to — traceably, every month.`,
    micro: "Cancel any time. Traceable, every month.",
  },
}[siteConfig.mode];

export default function FirstWave() {
  const innerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  useMaskedReveal(headingRef);
  useReveal(innerRef);

  return (
    <section id="join" className={styles.section} aria-labelledby="join-heading">
      <Pulse color="var(--green)" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/textures/rings-corner.svg"
        alt=""
        aria-hidden="true"
        className={styles.ringsCorner}
      />
      {/* The closing orb, matching the hero (Canvas #F5F2EC, ambient rotation).
          It mounts through LazyOrb, which owns the only live orb GL context at
          the bottom of the page while the hero's is unmounted off-screen — the
          two are never alive at once. Reduced motion keeps the static ring,
          exactly as the hero does. */}
      <div className={styles.ringLayer} aria-hidden="true">
        {reducedMotion ? (
          <Ring mode="spectrum" />
        ) : (
          <div className={styles.orbWrap}>
            <LazyOrb
              hue={250}
              hoverIntensity={0.25}
              ambientRotation
              ambientRotationSpeed={6}
              backgroundColor="#F5F2EC"
            />
          </div>
        )}
      </div>
      <div ref={innerRef} className={`container ${styles.inner}`}>
        <p className="eyebrow" data-reveal>
          {copy.eyebrow}
        </p>
        <h2
          ref={headingRef}
          id="join-heading"
          className={`display-section ${styles.headline}`}
        >
          {copy.headline}
        </h2>
        <p className={styles.body} data-reveal>
          {copy.body}
        </p>
        <div className={styles.form} data-reveal>
          <WaitlistForm variant="closing" />
        </div>
        <p className={styles.micro} data-reveal>
          {copy.micro}
        </p>
      </div>
    </section>
  );
}

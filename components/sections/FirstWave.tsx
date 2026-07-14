"use client";

import { useRef } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import Ring from "@/components/Ring";
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
      <div className={styles.ringLayer}>
        <Ring mode="spectrum" />
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

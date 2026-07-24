"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import dynamic from "next/dynamic";
import LazyMount from "@/components/LazyMount";
import Pulse from "@/components/Pulse";

// Code-split the OGL liquid-gradient shader out of the initial bundle — it sits
// at the foot of the page behind LazyMount, so it never blocks first paint.
const LiquidGradient = dynamic(() => import("@/components/LiquidGradient"), {
  ssr: false,
});
import WaitlistForm from "@/components/WaitlistForm";
import styles from "./FirstWave.module.css";

const copy = {
  waitlist: {
    eyebrow: "Join the first wave",
    headline: `Be one of the first ${siteConfig.pricing.dayOneCap.toLocaleString("en-GB")}.`,
    body: `Day Ones pay £${siteConfig.pricing.dayOne} a month. Locked in forever. When RAAYDR opens to everyone, it goes to £${siteConfig.pricing.standard}. You were early. On RAAYDR, that counts.`,
    micro:
      "No payment required to join the waitlist. We'll let you know when Day One spots open.",
  },
  live: {
    eyebrow: "Membership",
    headline: "The first wave is live.",
    body: `Membership is £${siteConfig.pricing.standard} a month. Your money follows the artists you actually listen to. Traceable, every month.`,
    micro: "Cancel any time. Traceable, every month.",
  },
}[siteConfig.mode];

export default function FirstWave() {
  const innerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskedReveal(headingRef);
  useReveal(innerRef);

  // The live metaball field is a heavier per-frame shader than the hero Orb, so
  // it runs on desktop only. Small screens (and reduced motion) get a static
  // high-res render of the same field — identical look, zero runtime cost. We
  // render the still first (SSR-safe) and upgrade to live only on a wide
  // enough, motion-allowing viewport, tracking both conditions reactively.
  const [live, setLive] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setLive(wide.matches && motionOk.matches);
    update();
    wide.addEventListener("change", update);
    motionOk.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      motionOk.removeEventListener("change", update);
    };
  }, []);

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
      {/* Closing liquid-gradient field (bottom-to-top: field -> scrim ->
          copy/form). The field mounts through LazyMount, which owns the only
          heavy GL context at the foot of the page while the hero's Orb is
          unmounted off-screen, so the two are never alive at once. Desktop runs
          the live shader; mobile and reduced motion get a static CSS gradient in
          the same palette. The scrim is a soft Canvas wash concentrated behind
          the copy that fades to transparent at the edges — the gradient stays
          rich at the margins while the centre calms enough for the text to
          read, without blurring the whole field. */}
      <div className={styles.fieldLayer} aria-hidden="true">
        {live ? (
          <LazyMount style={{ position: "absolute", inset: 0 }}>
            <LiquidGradient
              color1="#009E6F"
              color2="#63F2EB"
              color3="#6F00DE"
              color4="#6200A8"
              color5="#8B5CF6"
              color6="#6366F1"
              backgroundColor="#00FFD4"
              animationSpeed={1.5}
              gradientIntensity={1.8}
              gradientSize={0.45}
              gradientCount={12}
              touchStrength={1}
              grainIntensity={0.08}
              color1Weight={0.5}
              color2Weight={1.8}
            />
          </LazyMount>
        ) : (
          <div className={styles.fieldStill} />
        )}
        <div className={styles.scrim} />
      </div>
      <div ref={innerRef} className={`container ${styles.inner}`}>
        <p className="eyebrow" data-reveal style={{ fontWeight: 700 }}>
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
          <WaitlistForm variant="closing" source="homepage-bottom" />
        </div>
        <p className={styles.micro} data-reveal>
          {copy.micro}
        </p>
      </div>
    </section>
  );
}

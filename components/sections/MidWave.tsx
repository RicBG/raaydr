"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/lib/useReveal";
import LazyMount from "@/components/LazyMount";
import PageSpectraNoise from "@/components/PageSpectraNoise";
import WaitlistForm from "@/components/WaitlistForm";
import styles from "./MidWave.module.css";

// The second of three captures, placed straight after the How It Works wheel to
// catch people the moment they've understood the economy. It reuses the same
// WaitlistForm (email + "I'm joining as" role pills + button) as the hero and
// bottom blocks, so we still learn who each signup is, but it carries none of
// the founding-terms detail, which keeps it lighter than the bottom block.
// Signups are tagged source "homepage-mid" so the three captures can be told
// apart in the email tool.
//
// The background is the dust/noise Spectra effect (NOT the bottom lava-lamp
// field, so the two captures stay visually distinct). On desktop it runs live,
// mounted only while on screen via LazyMount, so its WebGL context is never
// alive at the same time as the hero Orb on the way down. Mobile and reduced
// motion use a static render of the same effect — no second live context where
// it's most likely to compete. A soft Canvas scrim keeps the form legible.
export default function MidWave() {
  const innerRef = useRef<HTMLDivElement>(null);
  useReveal(innerRef);

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
    <section className={styles.section} aria-labelledby="midwave-heading">
      <div className={styles.noise} aria-hidden="true">
        {live ? (
          <LazyMount style={{ position: "absolute", inset: 0 }}>
            <PageSpectraNoise audience="listeners" style={{ opacity: 0.5 }} />
          </LazyMount>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/textures/midwave-noise.png"
            alt=""
            className={styles.noiseStill}
          />
        )}
        <div className={styles.noiseScrim} />
      </div>
      <div ref={innerRef} className={`container ${styles.inner}`}>
        {/* The single spectrum accent — a thin tinted rule to lift the block
            from flat without adding copy or a second decoration. */}
        <span className={styles.accent} aria-hidden="true" data-reveal />
        <h2 id="midwave-heading" className={styles.heading} data-reveal>
          Join the first wave
        </h2>
        <div className={styles.form} data-reveal>
          <WaitlistForm variant="closing" source="homepage-mid" />
        </div>
      </div>
    </section>
  );
}

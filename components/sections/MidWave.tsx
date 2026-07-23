"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import WaitlistForm from "@/components/WaitlistForm";
import styles from "./MidWave.module.css";

// The second of three waitlist captures, placed straight after the How It Works
// wheel to catch people the moment they've understood the economy. It reuses the
// same WaitlistForm as the hero and bottom blocks (tagged source "homepage-mid"
// so the three captures can be told apart), presented as a single dark block
// with a little grain, echoing the "Follow the build" block on the About page.
// The Signal Green Spectra wave (the same dust field used at the top of the
// audience pages) sits on the section behind the block. It uses the static
// render of that field rather than the live WebGL one: the homepage already
// runs several WebGL layers, and the live field was not reliably getting a
// context here, so the still keeps the wave always visible and costs nothing.
// The block rises into place on scroll, as the payoff at the end of How It Works.
export default function MidWave() {
  const blockRef = useRef<HTMLDivElement>(null);

  // The block rises up as it scrolls into view. Scrubbed to the scroll, transform
  // and opacity only, so there is no layout shift. Stops under reduced motion.
  useEffect(() => {
    const block = blockRef.current;
    if (!block) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tw = gsap.fromTo(
        block,
        { y: 72, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: block,
            start: "top bottom",
            end: "top 62%",
            scrub: true,
          },
        }
      );
      return () => {
        tw.scrollTrigger?.kill();
        tw.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section className={styles.section} aria-labelledby="midwave-heading">
      {/* Signal Green Spectra wave on the section behind the block. */}
      <div className={styles.noise} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/textures/midwave-noise.png"
          alt=""
          className={styles.noiseStill}
        />
      </div>
      <div className="container">
        <div ref={blockRef} className={styles.block}>
          <h2 id="midwave-heading" className={styles.heading}>
            Join the first wave
          </h2>
          <div className={styles.form}>
            <WaitlistForm
              variant="closing"
              source="homepage-mid"
              theme="dark"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

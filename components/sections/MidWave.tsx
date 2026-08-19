"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import WaitlistForm from "@/components/WaitlistForm";
import LazyMount from "@/components/LazyMount";
import dynamic from "next/dynamic";
const DotPulse = dynamic(() => import("@/components/DotPulse"), { ssr: false });
import styles from "./MidWave.module.css";

// The second of three waitlist captures, placed straight after the How It Works
// wheel to catch people the moment they've understood the economy. It reuses the
// same WaitlistForm as the hero and bottom blocks (tagged source "homepage-mid"
// so the three captures can be told apart), presented as a single dark block
// with a little grain, echoing the "Follow the build" block on the About page.
// Behind the block sits the same pulsing dot field the RAAYDR+ blocks use, so
// the section reads dark. LazyMount holds the GL context only while the section
// is on screen, which keeps it from stacking with the homepage's other WebGL
// layers — the constraint that had the Spectra wave this replaced falling back
// to a still render.
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
    <section
      id="waitlist"
      className={styles.section}
      aria-labelledby="midwave-heading"
    >
      {/* Pulsing dot field on the section behind the block. */}
      <div className={styles.dotBg} aria-hidden="true">
        {/* Mounted well ahead of arrival, because this surface has real lead
            time before it can paint: the DotPulse chunk downloads, a GL
            context is created, shaders compile, the grid builds. At the
            default 200px a thumb-flick out of the pledge sequence landed here
            before any of that had happened and the field visibly popped in
            late. A viewport and a half of margin buys the whole pipeline;
            the render gate still keeps the loop itself parked until the
            section is nearly on screen.

            persistent, because tearing the context down on scroll-away means
            rebuilding it mid-scroll on the way back — the stall that was
            breaking this zone on phones. Setup happens once; after that the
            gate leaves a dormant context, not work. */}
        <LazyMount
          rootMargin="150%"
          persistent
          style={{ position: "absolute", inset: 0 }}
        >
          <DotPulse
            pattern="breathe"
            followPointer={false}
            backgroundColor="#05060A"
            dotColor="#FFFFFF"
            pulseColor="#FFFFFF"
            spacing={8}
            dotSize={1}
            speed={0.2}
            ringGap={400}
            pulseWidth={0.2}
            swell={3}
            push={20}
            jitter={0.15}
          />
        </LazyMount>
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
              showOffer
            />
          </div>
        </div>
      </div>
    </section>
  );
}

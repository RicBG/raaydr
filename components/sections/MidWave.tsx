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
// the section reads dark. Its GL context is created once at page load and kept
// (see the LazyMount below) rather than built on approach: building it on
// approach put a multi-second iPhone stall inside the pledge sequence that
// precedes this section.
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
        {/* eager + persistent: set up once at page load, never torn down —
            the same lifecycle as the gradient behind "People are the
            algorithm", and for the same reason.

            A viewport and a half of lead time used to be the answer here, and
            it is not enough, because the problem was never how EARLY the setup
            ran — it was that it ran mid-scroll at all. The chunk download, the
            GL context, the shader compile and the grid build are, on an
            iPhone, a main-thread stall measured in seconds, and 150% of a
            viewport before this section puts it squarely inside the pledge
            sequence: you feel the green promise panel snag, and by the time
            the thread comes back the field has either arrived late or, under
            the memory pressure of doing all that while four panels are
            composited, not at all. The section's own #05060a shows through
            when it does not, so the failure reads as "the background didn't
            load".

            At page load that same stall lands behind the first-load curtain
            (see lib/boot.ts), where nothing is scrolling and nothing is
            visible to snag. The render gate still parks the render loop until
            the section is nearly on screen, so what persists between here and
            there is a dormant context, not frames. */}
        <LazyMount eager persistent style={{ position: "absolute", inset: 0 }}>
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

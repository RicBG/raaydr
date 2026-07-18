"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import WaitlistForm from "@/components/WaitlistForm";
import styles from "./MidWave.module.css";

// The second of three captures, placed straight after the How It Works wheel to
// catch people the moment they've understood the economy. It reuses the same
// WaitlistForm (email + "I'm joining as" role pills + button) as the hero and
// bottom blocks, so we still learn who each signup is, but it carries none of
// the founding-terms detail, which keeps it lighter than the bottom block.
// Signups are tagged source "homepage-mid" so the three captures can be told
// apart in the email tool.
export default function MidWave() {
  const innerRef = useRef<HTMLDivElement>(null);
  useReveal(innerRef);

  return (
    <section className={styles.section} aria-labelledby="midwave-heading">
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

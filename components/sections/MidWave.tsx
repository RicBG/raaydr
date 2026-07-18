"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import WaitlistForm from "@/components/WaitlistForm";
import styles from "./MidWave.module.css";

// A lighter, second email capture placed straight after the How It Works
// wheel — it catches people the moment they've understood the economy. No
// role selector and no founding-terms detail, so it stays distinct from the
// fuller hero and closing blocks. Signups are tagged source "homepage-mid"
// so they can be told apart from the other two captures.
export default function MidWave() {
  const innerRef = useRef<HTMLDivElement>(null);
  useReveal(innerRef);

  return (
    <section className={styles.section} aria-labelledby="midwave-heading">
      <div ref={innerRef} className={`container ${styles.inner}`}>
        <h2 id="midwave-heading" className={styles.heading} data-reveal>
          Join the first wave
        </h2>
        <div className={styles.form} data-reveal>
          <WaitlistForm
            hideRoles
            implicitRole="Listener"
            source="homepage-mid"
            submitLabel="Claim your spot"
          />
        </div>
      </div>
    </section>
  );
}

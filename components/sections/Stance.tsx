"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import Pulse from "@/components/Pulse";
import styles from "./Stance.module.css";

export default function Stance() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  useMaskedReveal(statementRef);
  useReveal(innerRef);

  // Back out of the venue: deep lifts to canvas as the statement arrives.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        section,
        { "--section-bg": "#121216", "--section-ink": "#F2F4F7" },
        {
          "--section-bg": "#F5F2EC",
          "--section-ink": "#15151A",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "top 35%",
            scrub: true,
          },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="stance-heading"
    >
      <Pulse color="var(--violet)" />
      <div ref={innerRef} className={`container ${styles.inner}`}>
        <h2
          ref={statementRef}
          id="stance-heading"
          className={`display-section ${styles.statement}`}
        >
          Fair is not radical. It just looks that way because the bar is
          underground.
        </h2>
        <p className={styles.support} data-reveal>
          The old system was built to concentrate value at the top. RAAYDR
          sends it to the people who make the music, find the music, and fund
          the music.
        </p>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import Pulse from "@/components/Pulse";
import styles from "./Stance.module.css";

export default function Stance() {
  const sectionRef = useRef<HTMLElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  useMaskedReveal(statementRef);
  useReveal(innerRef);

  // Back out of the venue: the deep overlay fades OUT (opacity, compositor-
  // only) and the text ink lifts from light to dark as the statement arrives —
  // no per-frame background repaint.
  useEffect(() => {
    const section = sectionRef.current;
    const dark = darkRef.current;
    if (!section || !dark) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 35%",
          scrub: true,
        },
      });
      tl.fromTo(dark, { opacity: 1 }, { opacity: 0, ease: "none" }, 0).fromTo(
        section,
        { "--section-ink": "#F2F4F7" },
        { "--section-ink": "#15151A", ease: "none" },
        0
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
      <div ref={darkRef} className={styles.darkLayer} aria-hidden="true" />
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

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import Pulse from "@/components/Pulse";
import styles from "./Algorithm.module.css";

/**
 * A standalone banner/hero-style moment between the problem and how-it-works
 * sections — previously the closing beat inside Problem.tsx, now its own
 * full-viewport statement so it can carry the animated gradient on its own.
 */
export default function Algorithm() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  useMaskedReveal(headingRef);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        body,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: body, start: "top 80%" },
        }
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.fromTo(
        body,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          scrollTrigger: { trigger: body, start: "top 85%" },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="algorithm"
      className={styles.section}
      aria-labelledby="algorithm-heading"
    >
      <Pulse color="var(--violet)" />
      <div className={`container ${styles.inner}`}>
        <h2
          ref={headingRef}
          id="algorithm-heading"
          className={`display-section ${styles.heading}`}
        >
          People are the algorithm.
        </h2>
        <p ref={bodyRef} className={styles.body}>
          No black box deciding who gets heard. Real people, real taste, real
          money following both. The listeners who find it first. The
          tastemakers who back it early. The community that rates it. They
          are the engine.
        </p>
        <a href="#numbers" className={`link-sweep ${styles.mathsLink}`}>
          See the maths <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}

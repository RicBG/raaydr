"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useParallax } from "@/lib/useParallax";
import { useReveal } from "@/lib/useReveal";
import Pulse from "@/components/Pulse";
import Glyph from "@/components/Glyph";
import Calculator from "./Calculator";
import styles from "./RealNumbers.module.css";

const CANVAS = "#F5F2EC";
const INK = "#15151A";
const DEEP = "#121216";
const DEEP_INK = "#F2F4F7";

export default function RealNumbers() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const thesisRef = useRef<HTMLParagraphElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const closingRef = useRef<HTMLParagraphElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useMaskedReveal(headingRef);
  useMaskedReveal(thesisRef);
  useMaskedReveal(closingRef);
  useParallax(eyebrowRef, 0.95, 200);
  useReveal(bodyRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mm = gsap.matchMedia();

    // Walking into the venue: canvas tweens to deep over 600px of scroll,
    // scrubbed, while the section holds. No hard cut.
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.fromTo(
          section,
          { "--section-bg": CANVAS, "--section-ink": INK },
          {
            "--section-bg": DEEP,
            "--section-ink": DEEP_INK,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=600",
              pin: true,
              scrub: true,
            },
          }
        );
      }
    );

    // Same descent on small screens, scrubbed without pinning.
    mm.add(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.fromTo(
          section,
          { "--section-bg": CANVAS, "--section-ink": INK },
          {
            "--section-bg": DEEP,
            "--section-ink": DEEP_INK,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "top 15%",
              scrub: true,
            },
          }
        );
      }
    );
    // Reduced motion: the CSS default (already deep) stands, no tween.

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="numbers"
      className={styles.section}
      aria-labelledby="numbers-heading"
    >
      <Pulse color="var(--green)" />
      <div className="container">
        <div className={styles.header}>
          <p ref={eyebrowRef} className="eyebrow">
            // The real numbers
          </p>
          <h2
            ref={headingRef}
            id="numbers-heading"
            className={`display-section ${styles.headline}`}
          >
            You don&rsquo;t need a million streams. You need people who
            actually care.
          </h2>
          <p ref={thesisRef} className={styles.thesis}>
            This is what attention pays.
          </p>
        </div>

        <Calculator />

        <div ref={bodyRef}>
        <div className={styles.splitRow} data-reveal>
          <Glyph name="the-split" size={48} className={styles.splitGlyph} />
          <p className={styles.splitLine}>
            <span className="mono-figure">
              £5.99 − £0.99 tastemaker fund − 30% to RAAYDR = £3.50, the
              fan&rsquo;s artist money, every month.
            </span>{" "}
            Attention decides where the £3.50 goes. 40% of a fan&rsquo;s
            attention gets you 40% of their artist money. Play count
            doesn&rsquo;t decide it. Devotion does.
          </p>
        </div>

        {/* Honesty footnote: always visible, never behind a reveal. */}
        <p className={styles.footnote}>
          Founding tier, paid monthly, before payment processing. Spotify side
          assumes roughly £0.003 per stream, a typical blended rate for
          independent artists. £3.50 is the most one founding fan can generate
          in a month, and only if they listen to nothing but you. The match
          figure assumes an average of 4 streams per casual monthly listener.
        </p>
        </div>

        <p ref={closingRef} className={`display-statement ${styles.closing}`}>
          On RAAYDR, your earnings don&rsquo;t depend on how many times a
          button gets pressed. They depend on real people choosing you.
        </p>
      </div>
    </section>
  );
}

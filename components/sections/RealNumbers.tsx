"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useParallax } from "@/lib/useParallax";
import { useReveal } from "@/lib/useReveal";
import Pulse from "@/components/Pulse";
import Glyph from "@/components/Glyph";
import Calculator from "./Calculator";
import styles from "./RealNumbers.module.css";

const INK = "#15151A";
const DEEP_INK = "#F2F4F7";

export default function RealNumbers() {
  const sectionRef = useRef<HTMLElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
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
    const dark = darkRef.current;
    if (!section || !dark) return;
    const mm = gsap.matchMedia();

    // Walking into the venue: the deep overlay fades IN (opacity, compositor-
    // only) while the text ink tweens from dark to light — instead of
    // repainting the full pinned viewport's background every scroll frame.
    const descend = (
      trigger: ScrollTrigger.Vars
    ): void => {
      const tl = gsap.timeline({ scrollTrigger: trigger });
      tl.fromTo(dark, { opacity: 0 }, { opacity: 1, ease: "none" }, 0).fromTo(
        section,
        { "--section-ink": INK },
        { "--section-ink": DEEP_INK, ease: "none" },
        0
      );
    };

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        descend({
          trigger: section,
          start: "top top",
          end: "+=600",
          pin: true,
          scrub: true,
        });
      }
    );

    // Same descent on small screens, scrubbed without pinning.
    mm.add(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      () => {
        descend({
          trigger: section,
          start: "top 70%",
          end: "top 15%",
          scrub: true,
        });
      }
    );
    // Reduced motion: the CSS default (overlay opacity 1, deep ink) stands.

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="numbers"
      className={styles.section}
      aria-labelledby="numbers-heading"
    >
      <div ref={darkRef} className={styles.darkLayer} aria-hidden="true" />
      <Pulse color="var(--green)" />
      <div className={`container ${styles.content}`}>
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
              55% of every subscription goes to artists, after tax, publishing
              royalties and card fees.
            </span>{" "}
            Attention decides how that splits: the share of a fan&rsquo;s
            listening you hold is the share of their money you earn. Play count
            doesn&rsquo;t decide it. Devotion does.
          </p>
        </div>

        {/* Honesty footnote: always visible, never behind a reveal. */}
        <p className={styles.footnote}>
          Figures are projections based on your inputs, not a guarantee. Your
          share is 55% of every subscription, after tax, publishing royalties
          and card fees, divided by how much of each fan&rsquo;s listening you
          hold. The Spotify comparison is per monthly listener, the number
          Spotify for Artists actually shows you, not per stream.
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

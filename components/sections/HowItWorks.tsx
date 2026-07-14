"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useParallax } from "@/lib/useParallax";
import Pulse from "@/components/Pulse";
import Glyph from "@/components/Glyph";
import styles from "./HowItWorks.module.css";

const steps: {
  title: string;
  body: string;
  glyph?: "blip" | "bypass-arrow";
  /** The audience each step speaks to, in the site's canonical colour. */
  color: string;
}[] = [
  {
    title: "Artists submit.",
    body: "Independent artists upload their music. No label required. No gatekeeper to pass.",
    color: "var(--amber)",
  },
  {
    title: "Tastemakers pick.",
    body: "Trusted ears surface what's worth hearing first, and earn from a ringfenced fund when they're early and right.",
    glyph: "blip",
    color: "var(--orchid)",
  },
  {
    title: "Community rates.",
    body: "Listeners rate, save, share and comment. Engagement is the signal. People move the music, not a machine.",
    color: "var(--green)",
  },
  {
    title: "Everyone earns.",
    body: "Artists, producers, songwriters and tastemakers all get paid. Automatically. Traceably. Every month.",
    glyph: "bypass-arrow",
    color: "var(--violet)",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const ringsRef = useRef<HTMLImageElement>(null);
  useMaskedReveal(headingRef);
  useParallax(eyebrowRef, 0.95, 200);
  useParallax(ringsRef, 0.9, 200);

  useEffect(() => {
    const section = sectionRef.current;
    const list = listRef.current;
    if (!section || !list) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>("li"));
    const mm = gsap.matchMedia();

    // Pinned chapter: the section holds while the four steps swap through
    // 3000px of scroll, each entering with a rise and its number counting up.
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.set(rows.slice(1), { autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=3000",
            pin: true,
            scrub: 0.6,
          },
        });

        rows.forEach((row, i) => {
          const numberEl = row.querySelector<HTMLElement>("[data-step-number]");
          const counter = { n: 0 };
          const at = i;

          if (i > 0) {
            tl.fromTo(
              row,
              { autoAlpha: 0, y: 60 },
              { autoAlpha: 1, y: 0, duration: 0.22, ease: "none" },
              at
            );
          }
          if (numberEl) {
            tl.to(
              counter,
              {
                n: i + 1,
                duration: 0.25,
                ease: "none",
                snap: { n: 1 },
                onUpdate: () => {
                  numberEl.textContent = String(counter.n).padStart(2, "0");
                },
              },
              at
            );
          }
          if (i < rows.length - 1) {
            tl.to(
              row,
              { autoAlpha: 0, y: -60, duration: 0.22, ease: "none" },
              at + 0.78
            );
          }
        });
        tl.to({}, { duration: 0.3 }); // rest on the final step
      }
    );

    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      rows.forEach((row) => {
        gsap.fromTo(
          row,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            scrollTrigger: { trigger: row, start: "top 85%" },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={styles.section}
      aria-labelledby="how-heading"
    >
      <Pulse color="var(--amber)" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ringsRef}
        src="/textures/rings-corner.svg"
        alt=""
        aria-hidden="true"
        className={styles.ringsCorner}
      />
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <p ref={eyebrowRef} className="eyebrow">
            02 / How it works
          </p>
          <h2 ref={headingRef} id="how-heading" className="display-section">
            Four roles. One fair system.
          </h2>
        </div>

        <ol ref={listRef} className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <span
                className={`mono-figure ${styles.number}`}
                data-step-number
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={styles.stepText}>
                <h3
                  className={styles.stepTitle}
                  style={{ color: step.color }}
                >
                  {step.title}
                  {step.glyph && (
                    <Glyph
                      name={step.glyph}
                      size={40}
                      className={styles.stepGlyph}
                    />
                  )}
                </h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

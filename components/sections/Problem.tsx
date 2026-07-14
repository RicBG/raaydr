"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useParallax } from "@/lib/useParallax";
import Pulse from "@/components/Pulse";
import styles from "./Problem.module.css";

const manifestoOne = [
  "You pay £10.99 a month.",
  "Do you know where it goes?",
  "Into a pool. Divided by total streams.",
  "The artists with the most plays take the biggest share.",
  "Not the artists you actually listened to.",
  "The machine rewards the machine.",
];

const manifestoTwo = [
  "Your favourite independent artist sees fractions of a penny.",
  "The producer who made the beat? Often nothing.",
  "The songwriter? Don't even ask.",
  "That's not a music industry. That's extraction.",
  "We're done pretending it has to be this way.",
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  useMaskedReveal(headingRef);
  useParallax(eyebrowRef, 0.95, 200);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const lines = section.querySelectorAll("[data-manifesto-line]");
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Reading pace becomes scroll pace: each line's opacity is scrubbed
      // from 0.15 to full as it passes the viewport centre.
      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { opacity: 0.15, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: line,
              start: "top 75%",
              end: "top 48%",
              scrub: true,
            },
          }
        );
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.fromTo(
        lines,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          scrollTrigger: { trigger: section, start: "top 80%" },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className={styles.section}
      aria-labelledby="problem-heading"
    >
      <Pulse color="var(--coral)" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/textures/sweep-lines-corner.svg"
        alt=""
        aria-hidden="true"
        className={styles.sweepCorner}
      />
      <div className="container">
        <div className={styles.header}>
          <p ref={eyebrowRef} className="eyebrow">
            01 / The problem
          </p>
          <h2
            ref={headingRef}
            id="problem-heading"
            className={`display-section ${styles.headline}`}
          >
            Streaming is broken. Let&rsquo;s stop pretending it isn&rsquo;t.
          </h2>
        </div>

        <div className={styles.manifesto}>
          {manifestoOne.map((line) => (
            <p key={line} data-manifesto-line>
              {line}
            </p>
          ))}
        </div>

        <p className={`mono-figure ${styles.pullStat}`} data-manifesto-line>
          1,000 streams on Spotify pays for a coffee.
        </p>

        <div className={styles.manifesto}>
          {manifestoTwo.map((line) => (
            <p key={line} data-manifesto-line>
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

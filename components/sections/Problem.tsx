"use client";

import { useRef } from "react";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useParallax } from "@/lib/useParallax";
import Pulse from "@/components/Pulse";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import styles from "./Problem.module.css";

// One continuous locked paragraph (copy text unchanged from the previous
// per-line layout — only concatenated into a single block so
// ScrollTextReveal can light it up word-by-word as it scrolls).
const paragraph = [
  "You pay £10.99 a month.",
  "Do you know where it goes?",
  "Into a pool. Divided by total streams.",
  "The artists with the most plays take the biggest share.",
  "Not the artists you actually listened to.",
  "The machine rewards the machine.",
  "1,000 streams on Spotify pays for a coffee.",
  "Your favourite independent artist sees fractions of a penny.",
  "The producer who made the beat? Often nothing.",
  "The songwriter? Don't even ask.",
  "That's not a music industry. That's extraction.",
  "We're done pretending it has to be this way.",
].join(" ");

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  useMaskedReveal(headingRef);
  useParallax(eyebrowRef, 0.95, 200);

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
      <div className={`container ${styles.inner}`}>
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

        <ScrollTextReveal
          text={paragraph}
          revealMode="words"
          startOffset={90}
          endOffset={30}
          dimOpacity={0.2}
          className={styles.revealBlock}
        />
      </div>
    </section>
  );
}

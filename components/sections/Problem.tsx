"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The card physically rises into place: "top bottom" → "top top" is
      // already the section's exact natural, gap-free entrance window (the
      // hero's pin-spacer accounts for its own pin duration, so the section
      // arrives the instant the hero's recede finishes). A full yPercent:100
      // lag would double that travel distance and open a dead gap of plain
      // canvas between the hero ending and the card appearing — so this
      // stays a modest extra pull on top of the natural entrance, not a
      // replacement for it.
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "top top",
        scrub: true,
        animation: gsap.fromTo(
          section,
          { yPercent: 25 },
          { yPercent: 0, ease: "none" }
        ),
      });

      return () => trigger.kill();
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
      <div className={`container ${styles.inner}`}>
        <h2 id="problem-heading" className={`display-section ${styles.headline}`}>
          Streaming is broken. Let&rsquo;s stop pretending it isn&rsquo;t.
        </h2>

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

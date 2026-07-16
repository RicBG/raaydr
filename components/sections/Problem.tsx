"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Pulse from "@/components/Pulse";
import ScrollRevealText from "@/components/ScrollRevealText";
import styles from "./Problem.module.css";

// One continuous locked paragraph (copy text unchanged from the previous
// per-line layout — only concatenated into a single block so
// ScrollRevealText can light it up word-by-word as it scrolls).
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
      // A full yPercent:100 traversal needs runway: starting it at the
      // section's own natural "top bottom" (i.e. exactly when the hero's
      // pin ends) gives it only one viewport-height of scroll to close a
      // full viewport-height of handicap, which mathematically cannot
      // finish before "top top" without the card sitting static and fully
      // hidden for a stretch first — a dead gap of plain canvas. Starting
      // instead one viewport-height earlier (overlapping the hero's entire
      // recede) gives it that runway, so most of the handicap resolves
      // while the hero is still on screen. Ending at "top 65%" rather than
      // "top top" means it finishes settling shortly after the card starts
      // crossing into view instead of needing the full one-viewport
      // entrance window — the remaining approach to "top top" then plays
      // out as plain scroll, no residual dead space.
      //
      // The offset must land on the "top" (trigger-side) keyword, not
      // "bottom" (scroller-side) — "top bottom-=vh" silently breaks GSAP's
      // parser (verified: it collapses start to equal end), whereas
      // "top-=vh bottom" computes correctly. And it's a function, not a
      // fixed px number, so it stays correct if the viewport is resized.
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: () => `top-=${window.innerHeight} bottom`,
        end: "top 65%",
        scrub: true,
        animation: gsap.fromTo(
          section,
          { yPercent: 100 },
          // immediateRender:false is required here: fromTo() otherwise
          // snaps the element to yPercent:100 synchronously the instant
          // it's constructed, and since this tween's own target IS the
          // trigger, ScrollTrigger.create() then measures that already-
          // offset position as if it were the natural layout — silently
          // corrupting start/end (verified: it inflated them by almost
          // exactly one section-height).
          { yPercent: 0, ease: "none", immediateRender: false }
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

        <ScrollRevealText
          text={paragraph}
          preset="Glitch Rise"
          htmlTag="p"
          trigger="Scroll"
          offsetStart={90}
          offsetEnd={30}
          // This section sits on the dark --deep surface (see
          // Problem.module.css), not the light canvas the component's own
          // defaults assume — colours flipped to --deep-ink so hidden text
          // dims against the dark background instead of vanishing into it.
          colorHidden="rgba(242,244,247,0.2)"
          colorRevealed="#F2F4F7"
          font={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "clamp(1.25rem, 2.4vw, 1.85rem)",
            lineHeight: 1.55,
            letterSpacing: "-0.005em",
          }}
          style={{ maxWidth: "62ch", textAlign: "center" }}
        />
      </div>
    </section>
  );
}

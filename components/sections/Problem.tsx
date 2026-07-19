"use client";

import Pulse from "@/components/Pulse";
import ScrollRevealText from "@/components/ScrollRevealText";
import styles from "./Problem.module.css";

// One continuous locked paragraph (copy text unchanged from the previous
// per-line layout — only concatenated into a single block so
// ScrollRevealText can light it up word-by-word as it scrolls).
const paragraph = [
  "You pay £12.99 a month.",
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
  // No JS drives the cover any more: the hero sticks (see Hero.module.css)
  // and this opaque card, sitting directly after it in flow with a higher
  // z-index, simply scrolls up over it — so the black surface starts taking
  // over the screen the instant you scroll, then fully covers the hero as it
  // recedes. Pure CSS, and robust on every engine including iOS.
  return (
    <section
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
          preset="Default"
          htmlTag="p"
          trigger="Scroll"
          offsetStart={120}
          offsetEnd={-10}
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

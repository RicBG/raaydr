"use client";

// Three tilted scroll-ticker bands (white / black / white) that overlap the
// sections above and below, each phrase prefixed with a green "//". Used as the
// How It Works heading and as a section divider in place of the waveform.
// Decorative: the root is aria-hidden, so the repeating marquee is not read.

import ScrollTicker from "@/components/ScrollTicker";
import styles from "./TickerMarquee.module.css";

const WHITE_BAND = "var(--canvas)"; // the site's off-white hero colour
const BLACK_BAND = "var(--ink)";

// One loop unit per row: the phrase repeated, each prefixed with a green "//".
// The ScrollTicker replicates this to fill the width, so a few is plenty.
function items(phrase: string) {
  return Array.from({ length: 4 }, (_, i) => (
    <span key={i} className={styles.tickerItem}>
      <span className={styles.sep}>{"//"}</span>
      {phrase}
    </span>
  ));
}

type TickerMarqueeProps = {
  top: string;
  middle: string;
  bottom: string;
  className?: string;
  /** Keep the top overlap but add a gap below, so following content reads as
   *  separate rather than tucked under the last band. */
  spaceBelow?: boolean;
};

export default function TickerMarquee({
  top,
  middle,
  bottom,
  className,
  spaceBelow,
}: TickerMarqueeProps) {
  return (
    <div
      className={`${styles.tickerStack} ${spaceBelow ? styles.spaceBelow : ""} ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className={styles.tickerRow}>
        <ScrollTicker
          className={styles.band}
          background={WHITE_BAND}
          baseSpeed={25}
          gap={40}
          boostIntensity={1.4}
          paddingX={0}
          paddingY={16}
          initialDirection="left"
        >
          {items(top)}
        </ScrollTicker>
      </div>
      <div className={styles.tickerRow}>
        <ScrollTicker
          className={styles.band}
          background={BLACK_BAND}
          baseSpeed={50}
          gap={40}
          boostIntensity={1.4}
          paddingX={0}
          paddingY={16}
          initialDirection="right"
        >
          {items(middle)}
        </ScrollTicker>
      </div>
      <div className={styles.tickerRow}>
        <ScrollTicker
          className={styles.band}
          background={WHITE_BAND}
          baseSpeed={45}
          gap={40}
          boostIntensity={1.4}
          paddingX={0}
          paddingY={16}
          initialDirection="left"
        >
          {items(bottom)}
        </ScrollTicker>
      </div>
    </div>
  );
}

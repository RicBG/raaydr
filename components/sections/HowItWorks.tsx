import HowItWorksBento from "@/components/sections/HowItWorksBento";
import TickerMarquee from "@/components/TickerMarquee";
import styles from "./HowItWorks.module.css";

/**
 * How It Works: the tilted ticker bands as the heading, then a four card bento
 * of the four audiences.
 *
 * This replaced a pinned stepper wheel that rotated numbered steps along an
 * arc. The cards say the same four things without spending 350vh of scroll or
 * asking anyone to wait for a rotation to finish, and every destination is one
 * click from here rather than one click after a scrub.
 *
 * HowItWorksWheel is left in the repo, along with the old step images, since
 * nothing else in this change depends on deleting them.
 */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      {/* Tilted ticker bands as the heading, above the grid. Decorative, so
          the heading is announced once by the visually hidden h2 below. */}
      <TickerMarquee
        top="Attention pays"
        middle="How It Works"
        bottom="Everyone wins"
        spaceBelow
      />
      <h2 className="sr-only">How It Works</h2>

      <HowItWorksBento />
    </section>
  );
}

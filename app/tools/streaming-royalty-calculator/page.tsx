import type { Metadata } from "next";
import Link from "next/link";
import Calculator from "@/components/sections/Calculator";
import FaqAccordion from "@/components/FaqAccordion";
import type { FaqItem } from "@/lib/faqData";
import { MODELLED_SHARE_NOTE } from "@/lib/raaydrRates";
import { pageMetadata } from "@/lib/seo";
import styles from "./tool.module.css";

// The calculator used to live only inside /artists, so nothing could rank for
// "streaming royalty calculator". This is the same component on an address of
// its own, with the words around it that a results page needs. No new number
// is published here: the component and the FAQ are the ones already live
// (row 3263, technical win 4).
export const metadata: Metadata = pageMetadata({
  title: "Streaming Royalty Calculator UK: Spotify vs RAAYDR",
  description:
    "Work out what your fans are worth in pounds. See how many Spotify plays it takes to earn the same as fans who pay you directly on RAAYDR.",
  path: "/tools/streaming-royalty-calculator",
});

const FAQ: FaqItem[] = [
  {
    question: "Is this streaming royalty calculator in pounds?",
    answer:
      "Yes. Every figure is in pounds sterling, based on a UK subscription price.",
  },
  {
    question: "What does the calculator compare?",
    answer:
      "It takes a number of fans and the share of their listening that goes to you, then shows what that earns on RAAYDR and how many Spotify plays it would take to earn the same.",
  },
  {
    question: "Are the results guaranteed?",
    answer: `No. ${MODELLED_SHARE_NOTE.attention} Treat the result as a way to compare two ways of being paid, not as a forecast.`,
  },
  {
    question: "Where can I see what each platform pays per stream?",
    answer:
      "Platforms do not publish an official rate. Our guide sets out the commonly quoted estimates for Spotify, Apple Music and YouTube Music, with a worked table.",
  },
];

export default function StreamingRoyaltyCalculatorPage() {
  return (
    <main className={styles.page}>
      <header className={`container ${styles.header}`}>
        <p className="eyebrow">Free tool</p>
        <h1 className={`display-section ${styles.title}`}>
          Streaming royalty calculator
        </h1>
        <p className={styles.lead}>
          Put in how many fans you have and how much of their listening is yours.
          See what that earns in pounds, and how many Spotify plays it would take
          to match it.
        </p>
        <p className={styles.links}>
          Want per stream rates for each platform instead? Read{" "}
          <Link href="/pulse/streaming-royalty-calculator-uk">
            what Spotify, Apple Music and YouTube Music pay
          </Link>
          .
        </p>
      </header>

      <section className={styles.calc} id="calculator">
        <div className="container">
          <Calculator disclaimer />
        </div>
      </section>

      <FaqAccordion items={FAQ} />

      <section className={`container ${styles.more}`}>
        <h2 className={styles.moreHeading}>Keep reading</h2>
        <ul className={styles.moreList}>
          <li>
            <Link href="/pulse/how-much-does-spotify-pay-per-stream">
              How much does Spotify actually pay per stream?
            </Link>
          </li>
          <li>
            <Link href="/pulse/how-much-does-apple-music-pay-per-stream-uk">
              How much does Apple Music pay per stream in the UK?
            </Link>
          </li>
          <li>
            <Link href="/pulse/spotify-1000-stream-rule">
              Spotify&rsquo;s 1,000 stream rule
            </Link>
          </li>
          <li>
            <Link href="/artists">RAAYDR for artists</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

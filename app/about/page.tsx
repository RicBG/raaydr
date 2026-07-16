import type { Metadata } from "next";
import Link from "next/link";
import PageSpectraNoise from "@/components/PageSpectraNoise";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About RAAYDR — Built for the culture. Owned by the community.",
  description:
    "RAAYDR is an independent music streaming platform that pays the artists you actually listen to.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.noiseBg}>
        {/* Not audience-specific, so this page doesn't have a natural
            colour — Signal Green (--green) is the site's own primary/
            action colour, the closest thing to a neutral pick. */}
        <PageSpectraNoise audience="listeners" />
      </div>

      <div className={styles.content}>
        <div className="container">
          <p className="eyebrow">About</p>
          <h1 className={`display-section ${styles.title}`}>
            Built for the culture. Owned by the community.
          </h1>

          <div className={styles.body}>
            <p>
              RAAYDR is an independent music streaming platform that pays the
              artists you actually listen to. No pooled royalties, no black-box
              algorithm, no gatekeepers. Your subscription follows your
              listening, and you can trace where it went.
            </p>
            <p>
              The split is simple and public. £5.99 a month from a founding
              member: £0.99 is ringfenced for the tastemakers who find music
              first, RAAYDR keeps 30% of the remainder to run the platform, and
              £3.50 is that member&rsquo;s artist money — it follows the artists
              they actually listened to, divided by attention, not by play
              count. Producers and songwriters are paid automatically from
              splits built into every record.
            </p>
            <p>
              We&rsquo;re launching in waves. The first 1,000 founding members
              lock in £5.99 forever and fund the first cohort of independent
              artists on the platform. After that, membership opens at £7.99.
              Early counts here.
            </p>
            <p>
              RAAYDR is built by people who make music, produce music, and spend
              too much money going to see it live. If the last decade of
              streaming worked for you, this platform isn&rsquo;t for you. If it
              didn&rsquo;t — welcome.
            </p>
          </div>

          <Link href="/#join" className="btn">
            Join the free waitlist
          </Link>
        </div>
      </div>
    </main>
  );
}

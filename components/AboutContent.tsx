"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageSpectraNoise from "@/components/PageSpectraNoise";
import HeroCallout from "@/components/HeroCallout";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import styles from "@/app/about/about.module.css";

/**
 * The About page body. Client-side because it coordinates the page's single
 * heavy WebGL context: while the Hero Callout is on screen its gradient is the
 * only live context and the full-page PageSpectraNoise (fixed, so it never
 * scrolls off on its own) is unmounted — both driven by one IntersectionObserver
 * boolean, so the two are never live at once. The About page has no natural
 * audience colour, so — as with the existing noise band — it borrows Signal
 * Green (the "listeners" colour), the site's own primary.
 */
export default function AboutContent() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const calloutRef = useRef<HTMLElement>(null);
  useMaskedReveal(titleRef);
  useReveal(leadRef);
  useReveal(bodyRef);

  const [calloutActive, setCalloutActive] = useState(false);
  useEffect(() => {
    const el = calloutRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setCalloutActive(entries.some((e) => e.isIntersecting)),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <main className={styles.page}>
      {!calloutActive && (
        <div className={styles.noiseBg}>
          {/* Not audience-specific, so this page doesn't have a natural
              colour — Signal Green (--green) is the site's own primary/
              action colour, the closest thing to a neutral pick. */}
          <PageSpectraNoise audience="listeners" />
        </div>
      )}

      <section className={styles.content}>
        <div className="container">
          <p className="eyebrow">About</p>
          <h1 ref={titleRef} className={`display-section ${styles.title}`}>
            Built for the culture. Owned by the community.
          </h1>

          {/* The attitude paragraph now leads, immediately after the hero. */}
          <div ref={leadRef} className={styles.lead}>
            <p data-reveal>
              RAAYDR is built by people who make music, produce music, and spend
              too much money going to see it live. If the last decade of
              streaming worked for you, this platform isn&rsquo;t for you. If it
              didn&rsquo;t &mdash; welcome.
            </p>
          </div>
        </div>
      </section>

      <HeroCallout
        ref={calloutRef}
        audience="listeners"
        active={calloutActive}
        heading="The industry isn't broken. It was built this way."
        body={[
          "Streaming was designed to reward volume over connection. A formula, not a relationship. That's not an accident. That's the business model.",
          "We believe artists should be able to earn a living from their music alone. That producers and songwriters should be paid the moment their work plays, not chase a statement months later. That the people with the ears to find music first should be paid for that instinct. That the people who listen should know exactly where their money goes, and have a real say in what happens next.",
          "That's not a feature. That's why RAAYDR exists.",
        ]}
      />

      <section className={styles.content}>
        <div className="container">
          <div ref={bodyRef} className={styles.body}>
            <p data-reveal>
              RAAYDR is an independent music streaming platform that pays the
              artists you actually listen to. No pooled royalties, no black-box
              algorithm, no gatekeepers. Your subscription follows your
              listening, and you can trace where it went.
            </p>
            <p data-reveal>
              The split is simple and public. £5.99 a month from a founding
              member: £0.99 is ringfenced for the tastemakers who find music
              first, RAAYDR keeps 30% of the remainder to run the platform, and
              £3.50 is that member&rsquo;s artist money — it follows the artists
              they actually listened to, divided by attention, not by play
              count. Producers and songwriters are paid automatically from
              splits built into every record.
            </p>
            <p data-reveal>
              We&rsquo;re launching in waves. The first 1,000 founding members
              lock in £5.99 forever and fund the first cohort of independent
              artists on the platform. After that, membership opens at £7.99.
              Early counts here.
            </p>
          </div>

          <Link href="/#join" className="btn">
            Join the free waitlist
          </Link>
        </div>
      </section>
    </main>
  );
}

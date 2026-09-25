"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroCallout from "@/components/HeroCallout";
import FaqAccordion from "@/components/FaqAccordion";
import { InstagramIcon, TikTokIcon } from "@/components/SocialIcons";
import { faqData } from "@/lib/faqData";
import { siteConfig } from "@/lib/siteConfig";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import styles from "@/app/about/about.module.css";

/**
 * The About page body. Client-side because the IntersectionObserver below
 * gates the Hero Callout's own WebGL gradient, mounting it only while the
 * section is actually on screen.
 *
 * NO NOISE BAND, UNLIKE AN AUDIENCE PAGE. This page carried one until 24
 * September, tinted "listeners" green on the strength of a comment claiming
 * Signal Green was "the site's own primary/action colour, the closest thing
 * to a neutral pick" — true before 25 August, false since: that ruling moved
 * the site's action colour to `--brand` (#9B6BFF) and left green scoped to
 * listeners specifically (`app/globals.css` carries the exact wording,
 * "Ruled 25 Aug 2026, replacing Signal Green"). About was rendering as a
 * listener page.
 * `AudiencePage.tsx`'s own `halo?: RaaydrAudience` is already optional and
 * already skips the noise band entirely when a page has no natural audience
 * ("no audience to colour it" is that prop's own comment) — About follows
 * that existing precedent instead of inventing a fifth audience.
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
              didn&rsquo;t, welcome.
            </p>
          </div>
        </div>
      </section>

      <HeroCallout
        ref={calloutRef}
        audience="listeners"
        color="#9B6BFF"
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
              The split is simple and public. 55% of every subscription goes
              to artists, up to 15% is ring fenced for the tastemakers who find
              music first, and we keep 30%, each a share of what is left after
              tax, publishing royalties and card fees. The artists&rsquo; share
              follows the ones you actually listened to, divided by attention,
              not by play count. Producers and songwriters are paid
              automatically from splits built into every record.
            </p>
            <p data-reveal>
              We&rsquo;re launching in waves. The first{" "}
              {siteConfig.pricing.dayOneCap} Day Ones back the first cohort of
              independent artists on the platform: £{siteConfig.pricing.dayOne}{" "}
              a month, locked for as long as they stay subscribed. After that,
              RAAYDR is £{siteConfig.pricing.standard}. Early counts here.
            </p>
          </div>

          <Link href="/#join" className="btn">
            Join the free waitlist
          </Link>
        </div>
      </section>

      <section className={styles.follow}>
        <div className="container">
          <div className={styles.followInner}>
            <h2 className={styles.followHeading}>Follow the build</h2>
            <p className={styles.followText}>
              We&rsquo;re building RAAYDR in public. Follow along on Instagram
              and TikTok for the process, the progress, and everything in
              between.
            </p>
            <div className={styles.followLinks}>
              <a
                href="https://instagram.com/raaydrmusic"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                <InstagramIcon className={styles.followIcon} />
                Instagram
              </a>
              <a
                href="https://tiktok.com/@raaydrmusic"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.followGhost}
              >
                <TikTokIcon className={styles.followIcon} />
                TikTok
              </a>
            </div>
          </div>
        </div>
      </section>

      <FaqAccordion items={faqData.about} />
    </main>
  );
}

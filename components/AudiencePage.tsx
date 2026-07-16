"use client";

import { useEffect, useRef, useState } from "react";
import { SILHOUETTES } from "@/lib/silhouettes";
import { shuffle } from "@/lib/shuffle";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useParallax } from "@/lib/useParallax";
import { useReveal } from "@/lib/useReveal";
import Ring from "@/components/Ring";
import Silhouette from "@/components/Silhouette";
import HaloVideo from "@/components/HaloVideo";
import PageSpectraNoise, {
  type RaaydrAudience,
} from "@/components/PageSpectraNoise";
import WaitlistForm, { type ROLES } from "@/components/WaitlistForm";
import styles from "./AudiencePage.module.css";

type Point = { title: string; body: string };

type AudiencePageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  points: Point[];
  /** The audience colour — carried by the halo, never by flat UI. */
  color: string;
  /** Media stem for the living halo film (e.g. "artists") — also drives the
   *  top-of-page noise band's colour, since both key off the same audience
   *  identifier. Falls back to a static silhouette + code halo (and skips
   *  the noise band, with no audience to colour it) when absent. */
  halo?: RaaydrAudience;
  /** Preselect the waitlist role for this audience. */
  role?: (typeof ROLES)[number];
  /** An earnings calculator specific to this audience (producer/songwriter
   *  split, tastemaker fund) — rendered between the points and the join
   *  section. Omitted entirely (not just hidden) when a page has none. */
  calculator?: React.ReactNode;
};

export default function AudiencePage({
  eyebrow,
  title,
  lead,
  points,
  color,
  halo,
  role,
  calculator,
}: AudiencePageProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLDivElement>(null);
  useReveal(headerRef);
  useMaskedReveal(titleRef);
  useParallax(figureRef, 1.05, 240);
  useReveal(pointsRef);
  useReveal(joinRef);

  // Client-only randomness, deferred a frame so server and client markup
  // agree and hydration stays clean. Only used for the static fallback.
  const [face, setFace] = useState<string | null>(null);
  useEffect(() => {
    if (halo) return;
    const frame = requestAnimationFrame(() => setFace(shuffle(SILHOUETTES)[0]));
    return () => cancelAnimationFrame(frame);
  }, [halo]);

  return (
    <main
      className={styles.page}
      style={{ "--halo-color": color } as React.CSSProperties}
    >
      {halo && (
        <div className={styles.noiseBg}>
          <PageSpectraNoise audience={halo} />
        </div>
      )}

      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div ref={headerRef} className={styles.heroCopy}>
            <p className="eyebrow" data-reveal>
              {eyebrow}
            </p>
            <h1 ref={titleRef} className={`display-section ${styles.title}`}>
              {title}
            </h1>
            <p className={styles.lead} data-reveal>
              {lead}
            </p>
          </div>
          <div
            ref={figureRef}
            className={halo ? styles.figureVideo : styles.figure}
          >
            {halo ? (
              <HaloVideo name={halo} className={styles.haloVideo} />
            ) : (
              <>
                <div className={styles.halo}>
                  <Ring mode="halo" />
                </div>
                <Silhouette src={face} className={styles.portrait} />
              </>
            )}
          </div>
        </div>
      </section>

      <section className={styles.points}>
        <div className="container">
          <div
            ref={pointsRef}
            className={styles.pointsGrid}
            style={{ "--points-count": points.length } as React.CSSProperties}
          >
            {points.map((point, i) => (
              <div key={point.title} className={styles.point} data-reveal>
                <span className={`mono-figure ${styles.pointNumber}`} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className={styles.pointTitle}>{point.title}</h2>
                <p className={styles.pointBody}>{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {calculator && (
        <section className={styles.calcSection}>
          <div className="container">
            <p className="eyebrow" data-reveal>
              Do the maths
            </p>
            {calculator}
          </div>
        </section>
      )}

      <section className={styles.join} id="join">
        <div className="container">
          <div ref={joinRef} className={styles.joinInner}>
            <p className="eyebrow" data-reveal>
              Join the first wave
            </p>
            <div data-reveal>
              <WaitlistForm variant="closing" defaultRole={role} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

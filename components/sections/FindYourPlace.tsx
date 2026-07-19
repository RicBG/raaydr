"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useParallax } from "@/lib/useParallax";
import Ring from "@/components/Ring";
import Silhouette from "@/components/Silhouette";
import Pulse from "@/components/Pulse";
import styles from "./FindYourPlace.module.css";

const audiences = [
  {
    name: "The Artist",
    color: "#EBA83A",
    message:
      "Get paid for the people who actually listen. Automatic splits for everyone who made the record.",
    href: "/artists",
    silhouette: "/silhouettes/silhouette-06.png",
  },
  {
    name: "The Producer & Songwriter",
    color: "#8C7AE6",
    message:
      "Credited, found, and paid the moment your work plays. The split is built in, not begged for.",
    href: "/producers-songwriters",
    silhouette: "/silhouettes/silhouette-08.png",
  },
  {
    name: "The Tastemaker",
    color: "#E585AC",
    message:
      "Back music early. Build a reputation. Earn from a fund that rewards your taste.",
    href: "/tastemakers",
    silhouette: "/silhouettes/silhouette-07.png",
  },
  {
    name: "The Listener",
    color: "#3BCE7B",
    message:
      "Your money follows your ears. Every month, you can see exactly who it reached.",
    href: "/for-listeners",
    silhouette: "/silhouettes/silhouette-03.png",
  },
];

export default function FindYourPlace() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  useMaskedReveal(headingRef);
  useParallax(eyebrowRef, 0.95, 200);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const moments = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-moment]")
    );
    const figures = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-figure]")
    );
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.set(moments.slice(1), { autoAlpha: 0 });
        gsap.set(stage, { "--halo-color": audiences[0].color });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 0.6,
          },
        });

        // Slow drift on the resting figure — the 1.05x depth layer.
        tl.fromTo(
          figures[0],
          { y: 16 },
          { y: -14, duration: 0.55, ease: "none" },
          0
        );

        // The signature transition: the outgoing figure dissolves, the halo
        // carries the colour morph alone for a beat, then the next figure
        // arrives under the new colour.
        audiences.slice(0, -1).forEach((_, i) => {
          const at = 0.55 + i;
          tl.to(
            moments[i],
            { autoAlpha: 0, y: -44, duration: 0.18, ease: "none" },
            at
          )
            .to(
              stage,
              {
                "--halo-color": audiences[i + 1].color,
                duration: 0.45,
                ease: "none",
              },
              at
            )
            .fromTo(
              moments[i + 1],
              { autoAlpha: 0, y: 44 },
              { autoAlpha: 1, y: 0, duration: 0.18, ease: "none" },
              at + 0.27
            )
            .fromTo(
              figures[i + 1],
              { y: 16 },
              { y: -14, duration: 0.73, ease: "none" },
              at + 0.27
            );
        });
        tl.to({}, { duration: 0.55 }); // rest on the final moment
      }
    );

    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      moments.forEach((moment) => {
        gsap.fromTo(
          moment,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            scrollTrigger: { trigger: moment, start: "top 85%" },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="find-your-place"
      className={styles.section}
      aria-labelledby="place-heading"
    >
      <Pulse color="var(--orchid)" />
      <div className={`container ${styles.headerWrap}`}>
        <div className={styles.header}>
          <p ref={eyebrowRef} className="eyebrow">
            // Find your place
          </p>
          <h2 ref={headingRef} id="place-heading" className="display-section">
            Everyone wins.
          </h2>
        </div>
      </div>

      <div ref={stageRef} className={styles.stage}>
        {/* One persistent halo on desktop; the timeline tweens its colour
            between audiences while the silhouettes crossfade through it. */}
        <div className={styles.sharedHalo}>
          <Ring mode="halo" />
        </div>

        <div className={`container ${styles.stageInner}`}>
          {audiences.map((audience) => (
            <article
              key={audience.name}
              data-moment
              className={styles.moment}
              style={{ "--moment-color": audience.color } as React.CSSProperties}
            >
              <div className={styles.figure} data-figure>
                <div className={styles.momentHalo}>
                  <Ring mode="halo" />
                </div>
                <Silhouette
                  src={audience.silhouette}
                  className={styles.portrait}
                />
              </div>
              <div className={styles.copy}>
                <h3 className={styles.audienceName}>{audience.name}</h3>
                <p className={styles.message}>{audience.message}</p>
                <Link
                  href={audience.href}
                  className={`link-sweep ${styles.explore}`}
                >
                  Explore <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

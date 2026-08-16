"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { trackHowItWorksCardClick } from "@/lib/analytics";
import {
  HOW_IT_WORKS_CARDS,
  HOW_IT_WORKS_STRIP,
} from "@/lib/howItWorks";
import styles from "./HowItWorksBento.module.css";

/**
 * The four card bento that replaced the numbered stepper wheel.
 *
 * Layout is a four column grid: the listeners card spans two columns and both
 * rows on the left, the artists card spans the top right, and tastemakers and
 * credits take one column each below it. On phones the whole thing collapses to
 * a single column in source order, which is already the briefed order, so
 * nothing needs reordering.
 *
 * Each card is one link with the whole surface clickable, and the CTA label is
 * always visible: hover adds emphasis but never reveals anything, so touch and
 * keyboard lose nothing.
 *
 * The image is a background layer rather than an <img>. It is decorative (the
 * headline carries the meaning), it needs to scale and drift under a stack of
 * gradients, and a background degrades to the card's own colour field if the
 * file is missing instead of leaving a broken image icon.
 */
export default function HowItWorksBento() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`, grid);
      if (cards.length === 0) return;

      // Entrance: rise and fade as the section arrives. Once only, so
      // scrolling back up does not replay it.
      const entrance = gsap.from(cards, {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: grid, start: "top 80%", once: true },
      });

      // Idle: the image layer alone drifts a few px. Text never moves, so the
      // card reads as still and only the picture breathes. Each card is offset
      // so the four are not in lockstep.
      const drifts = cards.map((card, i) => {
        const media = card.querySelector<HTMLElement>(`.${styles.media}`);
        if (!media) return null;
        return gsap.to(media, {
          yPercent: i % 2 === 0 ? -1.4 : 1.4,
          duration: 7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.6,
        });
      });

      return () => {
        entrance.scrollTrigger?.kill();
        entrance.kill();
        drifts.forEach((d) => d?.kill());
        gsap.set(cards, { clearProps: "transform,opacity" });
      };
    });

    return () => {
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <>
      <div ref={gridRef} className={`container ${styles.grid}`}>
        {HOW_IT_WORKS_CARDS.map((card) => (
          <Link
            key={card.role}
            href={card.href}
            className={`${styles.card} ${styles[card.role]}`}
            onClick={() => trackHowItWorksCardClick(card.role)}
          >
            <div
              className={styles.media}
              style={{ backgroundImage: `url(${card.image})` }}
              role="img"
              aria-label={card.alt}
            />
            {/* Amber halo behind the head on the artists card. The source image
                has no halo and its background is flat, so this is a radial
                gradient multiplied over it rather than an edit to the file.
                Sits under the bleed, above the picture. */}
            {card.role === "artists" && (
              <div className={styles.halo} aria-hidden="true" />
            )}
            <div className={styles.scrim} aria-hidden="true" />
            <div className={styles.content}>
              <h3 className={styles.headline}>{card.headline}</h3>
              <p className={styles.body}>{card.body}</p>
              <span className={styles.cta}>
                {card.cta}
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="container">
        <div className={styles.strip}>
          <p className={styles.stripText}>{HOW_IT_WORKS_STRIP.text}</p>
          <Link
            href={HOW_IT_WORKS_STRIP.href}
            className={`link-sweep ${styles.stripLink}`}
          >
            {HOW_IT_WORKS_STRIP.linkLabel}
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>
    </>
  );
}

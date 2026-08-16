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
      const medias = cards
        .map((c) => c.querySelector<HTMLElement>(`.${styles.media}`))
        .filter((m): m is HTMLElement => Boolean(m));

      // Entrance: the cards rise into place rather than appearing. The image
      // inside each one starts lower and settles with it, so the card reveals
      // with a little internal parallax instead of moving as a flat slab.
      //
      // clearProps matters: without it GSAP leaves an inline transform on the
      // card when the tween ends, and an inline transform beats the stylesheet,
      // so the CSS hover lift would silently stop working.
      const entrance = gsap.timeline({
        scrollTrigger: { trigger: grid, start: "top 82%", once: true },
      });
      entrance
        .from(cards, {
          y: 48,
          opacity: 0,
          scale: 0.97,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform,opacity",
        })
        .from(
          medias,
          {
            yPercent: 12,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.12,
          },
          0
        );

      // Alive on scroll: the image layer drifts against the page as the
      // section passes, the same parallax language the rest of the site uses.
      // Scrubbed, so it tracks the scroll rather than running on its own clock.
      const parallax = gsap.fromTo(
        medias,
        { yPercent: 4 },
        {
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: grid,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );

      // Alive at rest: a slow breath on the image only. Scale, not position, so
      // it does not fight the scrubbed parallax above, which owns y. Offset per
      // card so the four are never in lockstep. Text never moves.
      const breaths = medias.map((media, i) =>
        gsap.to(media, {
          scale: 1.035,
          duration: 7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.8,
        })
      );

      return () => {
        entrance.scrollTrigger?.kill();
        entrance.kill();
        parallax.scrollTrigger?.kill();
        parallax.kill();
        breaths.forEach((t) => t.kill());
        gsap.set(cards, { clearProps: "transform,opacity" });
        gsap.set(medias, { clearProps: "transform" });
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
            {/* Two layers on purpose. GSAP owns the inner element's transform
                for the scrubbed parallax and the breath; the wrapper is left
                free for the CSS hover scale, so the two never overwrite each
                other's transform. */}
            <div className={styles.mediaWrap}>
              <div
                className={styles.media}
                style={{ backgroundImage: `url(${card.image})` }}
                role="img"
                aria-label={card.alt}
              />
            </div>
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

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { ctaCopy } from "@/lib/siteConfig";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import Ring from "@/components/Ring";
import RaaydrOrb from "@/components/RaaydrOrb";
import styles from "./Hero.module.css";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const orbLayerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // The orb shader blends its edges against a flat colour, so it must be
  // told exactly what is painted behind it. Measured at runtime — walk up
  // from the hero to the first ancestor with a real background — rather
  // than assuming the nominal token, so a future background change can't
  // reintroduce a visible canvas seam. (Measured today: body,
  // rgb(245, 242, 236).)
  const [orbBg, setOrbBg] = useState("#F5F2EC");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let el: HTMLElement | null = sectionRef.current;
      while (el) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          setOrbBg(bg);
          return;
        }
        el = el.parentElement;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const orbLayer = orbLayerRef.current;
    const stack = stackRef.current;
    const heading = headingRef.current;
    const subcopy = subcopyRef.current;
    const cta = ctaRef.current;
    if (!section || !orbLayer || !stack || !heading || !subcopy || !cta) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const split = new SplitText(heading, { type: "words" });

      // Load: heading (word-by-word via SplitText), then subcopy, then CTA —
      // each overlapping the previous slightly so the stack feels like one
      // considered motion rather than separate pops.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(split.words, { opacity: 0, y: 28, duration: 0.8, stagger: 0.06 })
        .from(subcopy, { opacity: 0, y: 20, duration: 0.7 }, "-=0.5")
        .from(cta, { opacity: 0, y: 16, duration: 0.6 }, "-=0.4");

      // Pin the hero for one viewport of scroll while the copy stack
      // recedes (scales down, dims, softens) and the orb behind it grows —
      // opposite motions, scrubbed together, so the handoff feels like
      // energy passing into the orb rather than everything just shrinking.
      // The section itself stays fixed in place; "Streaming is broken"
      // then scrolls up from normal document flow and covers it.
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        animation: gsap
          .timeline()
          .to(
            stack,
            { scale: 0.92, opacity: 0.85, filter: "blur(2px)", ease: "none" },
            0
          )
          .to(orbLayer, { scale: 1.1, ease: "none" }, 0),
      });

      return () => {
        tl.kill();
        trigger.kill();
        split.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={styles.hero}
      aria-label="RAAYDR"
    >
      <div className={styles.content}>
        <div className={`container ${styles.middle}`}>
          <div ref={orbLayerRef} className={styles.ringLayer}>
            {reducedMotion ? (
              // Static fallback: the code-drawn ring renders without its rAF
              // loop under reduced motion; the orb has no static mode.
              <Ring mode="spectrum" />
            ) : (
              <div className={styles.orbWrap}>
                <RaaydrOrb
                  hue={250}
                  hoverIntensity={0.25}
                  ambientRotation
                  ambientRotationSpeed={6}
                  backgroundColor={orbBg}
                />
              </div>
            )}
          </div>

          <div ref={stackRef} className={styles.textStack}>
            <h1 ref={headingRef} className={styles.heading}>
              The music industry forgot who makes the music.
            </h1>
            <p ref={subcopyRef} className={styles.subcopy}>
              On RAAYDR, your money follows your ears. Traceable, every
              month.
            </p>
            <a
              ref={ctaRef}
              href="#join"
              className={`btn ${styles.heroCta}`}
            >
              {ctaCopy().primary} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

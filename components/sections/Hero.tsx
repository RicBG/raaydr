"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ctaCopy } from "@/lib/siteConfig";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import Ring from "@/components/Ring";
import RaaydrOrb from "@/components/RaaydrOrb";
import styles from "./Hero.module.css";

const tags = [
  { label: "Artists", href: "/artists" },
  { label: "Tastemakers", href: "/tastemakers" },
  { label: "Listeners", href: "#join" },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
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
    const content = contentRef.current;
    const center = centerRef.current;
    const bottom = bottomRef.current;
    if (!section || !content || !center || !bottom) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Load: the CTA and bottom info bar rise and fade in.
      gsap.from([center.querySelector(`.${styles.heroCta}`), bottom], {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.25,
      });

      // Pin the hero for one viewport of scroll while its inner content —
      // ring, CTA, bottom bar, all of it as one group — subtly recedes
      // (scales down, dims, softens). The section itself stays fixed in
      // place; only its content wrapper animates. "Streaming is broken"
      // then slides up from normal document flow and covers it.
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        animation: gsap.to(content, {
          scale: 0.92,
          opacity: 0.85,
          filter: "blur(2px)",
          ease: "none",
        }),
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.fromTo(
        [center, bottom],
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
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
      <h1 className="sr-only">RAAYDR</h1>

      <div ref={contentRef} className={styles.content}>
        <div className={`container ${styles.middle}`}>
          <div className={styles.ringLayer}>
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

          <div ref={centerRef} className={styles.center}>
            <a href="#join" className={`btn ${styles.heroCta}`}>
              {ctaCopy().primary} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div ref={bottomRef} className={`container ${styles.bottom}`}>
          <div className={styles.bottomLeft}>
            <p className="eyebrow">Independent music · Funded by you</p>
            <p className={styles.intro}>
              The music industry forgot who makes the music. On RAAYDR, your
              money follows your ears. Traceable, every month.
            </p>
          </div>
          <div className={styles.bottomRight}>
            {tags.map((tag) =>
              tag.href.startsWith("#") ? (
                <a key={tag.label} href={tag.href} className={styles.tag}>
                  {tag.label}
                </a>
              ) : (
                <Link key={tag.label} href={tag.href} className={styles.tag}>
                  {tag.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

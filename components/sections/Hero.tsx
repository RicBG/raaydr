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
  const heroPinRef = useRef<HTMLDivElement>(null);
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

  // First-paint order: the ring/orb is a WebGL canvas that takes real time to
  // compile its shader and draw its first frame. We hold the hero content
  // hidden (CSS opacity:0 on the orb layer, GSAP-hidden text) until the orb
  // signals its first drawn frame, then reveal ring-first, text-second — so
  // the page never flashes bare text over a blank canvas. The timeout is a
  // safety net: if WebGL fails or reduced motion swaps the orb for the static
  // Ring (which never fires the callback), content still reveals.
  const [orbReady, setOrbReady] = useState(false);
  useEffect(() => {
    // Reduced motion renders the static Ring instead of the orb, so there's
    // no first-frame callback to wait for — reveal on the next tick. Otherwise
    // the orb's onFirstFrame drives the reveal, with this timeout as a safety
    // net. (Deferred via setTimeout rather than a synchronous setState so it
    // doesn't trigger a cascading render inside the effect.)
    const t = setTimeout(() => setOrbReady(true), reducedMotion ? 0 : 1000);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  // Intro reveal — runs once the orb has painted (or the fallback fires).
  useEffect(() => {
    if (!orbReady) return;
    const orbLayer = orbLayerRef.current;
    const stack = stackRef.current;
    const heading = headingRef.current;
    const subcopy = subcopyRef.current;
    const cta = ctaRef.current;
    if (!orbLayer || !stack || !heading || !subcopy || !cta) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const split = new SplitText(heading, { type: "words" });

      // Ring fades up first; the text stack (heading word-by-word, then
      // subcopy, then CTA) staggers in starting slightly after, so the
      // sequence reads ring-first, not everything at once.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(orbLayer, { opacity: 1, duration: 0.7, ease: "power2.out" })
        .from(split.words, { opacity: 0, y: 28, duration: 0.8, stagger: 0.06 }, 0.28)
        .from(subcopy, { opacity: 0, y: 20, duration: 0.7 }, "-=0.5")
        .from(cta, { opacity: 0, y: 16, duration: 0.6 }, "-=0.4");

      return () => {
        tl.kill();
        split.revert();
      };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([orbLayer, stack], { opacity: 1 });
    });

    return () => mm.revert();
  }, [orbReady]);

  // Scroll recede — the hero holds itself in place via CSS position:sticky
  // (see .heroPin/.hero in Hero.module.css) while the Problem card scrolls up
  // and covers it. This just scrubs the recede across that one-viewport
  // sticky range: the copy stack scales down/dims/softens and the orb behind
  // it grows, so it reads as energy passing into the orb as it's covered.
  useEffect(() => {
    const heroPin = heroPinRef.current;
    const orbLayer = orbLayerRef.current;
    const stack = stackRef.current;
    if (!heroPin || !orbLayer || !stack) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const trigger = ScrollTrigger.create({
        trigger: heroPin,
        start: "top top",
        // One viewport of scroll — the range over which the card covers the
        // hero. (heroPin is 200svh; the recede maps to its first half.)
        end: "+=100%",
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
        trigger.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={heroPinRef} className={styles.heroPin}>
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
                  onFirstFrame={() => setOrbReady(true)}
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
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { ctaCopy } from "@/lib/siteConfig";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import dynamic from "next/dynamic";
import Ring from "@/components/Ring";
import LazyMount from "@/components/LazyMount";

// Code-split the OGL orb out of the initial bundle — it's client-only (mounted
// through LazyMount) and its reveal already waits on onFirstFrame, so the
// async chunk load is absorbed by that gate rather than blocking first paint.
const RaaydrOrb = dynamic(() => import("@/components/RaaydrOrb"), {
  ssr: false,
});
import styles from "./Hero.module.css";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroPinRef = useRef<HTMLDivElement>(null);
  const orbLayerRef = useRef<HTMLDivElement>(null);
  const orbWrapRef = useRef<HTMLDivElement>(null);
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

  // The orb is a WebGL canvas that takes real time to fetch, compile and draw:
  // measured at 0.8s on a fast connection and 4.4s on a throttled phone. This
  // used to hold the whole hero back until that first frame, behind a 1s
  // safety timeout, which meant the timeout almost always won and the hero
  // showed bare text over an empty ring layer for the rest of that wait.
  //
  // The layer now paints a CSS stand-in immediately and the orb cross-fades
  // over it when ready, so nothing waits on WebGL and there is no gap to
  // cover. No timeout is needed either: if WebGL fails outright the flag stays
  // false and the stand-in simply remains, which is a better fallback than
  // anything a timer could do.
  const [orbReady, setOrbReady] = useState(false);

  // Intro reveal — runs on mount. It no longer waits on the orb: coupling the
  // copy to a WebGL first frame was what delayed the text, and the text is the
  // LCP element, so making it wait made the page measurably slower to show
  // anything meaningful.
  useEffect(() => {
    const orbLayer = orbLayerRef.current;
    const stack = stackRef.current;
    const heading = headingRef.current;
    const subcopy = subcopyRef.current;
    const cta = ctaRef.current;
    if (!orbLayer || !stack || !heading || !subcopy || !cta) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const split = new SplitText(heading, { type: "words" });

      // Transform only, no opacity. The heading is this page's LCP element,
      // and an element still fading in does not count as painted, so fading it
      // would push LCP out by the length of the tween for no gain the eye
      // notices. The words still arrive with a staggered rise; they simply
      // rise while already legible.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(split.words, { y: 28, duration: 0.8, stagger: 0.06 }, 0)
        .from(subcopy, { y: 20, duration: 0.7 }, "-=0.5")
        .from(cta, { y: 16, duration: 0.6 }, "-=0.4");

      return () => {
        tl.kill();
        split.revert();
      };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([orbLayer, stack], { opacity: 1, clearProps: "transform" });
    });

    return () => mm.revert();
  }, []);

  // Scroll recede — the hero holds itself in place via CSS position:sticky
  // (see .heroPin/.hero in Hero.module.css) while the opaque Problem card
  // (z-index above this layer) scrolls up and covers it. This scrubs the
  // recede across that one-viewport sticky range so the hero visibly steps
  // back as the card takes the frame, rather than staying lit until the
  // card's edge cuts across it. Everything here is compositor-only
  // (transform/opacity/filter) — the OGL canvas buffer is never resized.
  useEffect(() => {
    const heroPin = heroPinRef.current;
    const orbLayer = orbLayerRef.current;
    const orbWrap = orbWrapRef.current;
    const stack = stackRef.current;
    if (!heroPin || !orbLayer || !stack) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Timeline total is 1 unit. The copy finishes receding at ~0.475 —
      // gone BEFORE the rising card's top edge reaches where it sat, so lit
      // text is never bisected by the card edge. The orb spans the full
      // scrub: it grows for the parallax push and dims so the card owns the
      // frame by the end.
      const tl = gsap
        .timeline()
        .to(
          stack,
          {
            opacity: 0,
            scale: 0.96,
            filter: "blur(6px)",
            ease: "none",
            duration: 0.475,
          },
          0
        )
        // Scale the orb's container layer (no OGL buffer resize) for the push.
        .to(orbLayer, { scale: 1.25, ease: "none", duration: 1 }, 0);

      // Fade the orb wrapper (not orbLayer, whose opacity the intro reveal
      // owns) so its recede start value is a stable 1, uncoupled from the
      // intro. Guarded because the wrapper only exists in this branch.
      if (orbWrap) {
        tl.to(orbWrap, { opacity: 0.35, ease: "none", duration: 1 }, 0);
      }

      const trigger = ScrollTrigger.create({
        trigger: heroPin,
        start: "top top",
        // One viewport of scroll — the range over which the card covers the
        // hero. (heroPin is 200svh; the recede maps to its first half.)
        end: "+=100%",
        scrub: true,
        animation: tl,
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
          <div
            ref={orbLayerRef}
            className={styles.ringLayer}
            data-orb-ready={orbReady ? "true" : undefined}
          >
            {/* Paints with the document, so the hero is never missing its
                centrepiece. Decorative: the orb it stands in for is too. */}
            {!reducedMotion && (
              <div className={styles.orbStandIn} aria-hidden="true" />
            )}
            {reducedMotion ? (
              // Static fallback: the code-drawn ring renders without its rAF
              // loop under reduced motion; the orb has no static mode.
              <Ring mode="spectrum" />
            ) : (
              <div ref={orbWrapRef} className={styles.orbWrap}>
                <div className={styles.orbFade}>
                <LazyMount eager style={{ width: "100%", height: "100%" }}>
                  <RaaydrOrb
                    hue={250}
                    hoverIntensity={0.25}
                    ambientRotation
                    ambientRotationSpeed={6}
                    backgroundColor={orbBg}
                    onFirstFrame={() => setOrbReady(true)}
                  />
                </LazyMount>
                </div>
              </div>
            )}
          </div>

          <div ref={stackRef} className={styles.textStack}>
            <h1 ref={headingRef} className={styles.heading}>
              Music streaming is broken. We fixed it. Now everyone wins.
            </h1>
            <p ref={subcopyRef} className={styles.subcopy}>
              Attention over streams.
            </p>
            <a
              ref={ctaRef}
              href="#waitlist"
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

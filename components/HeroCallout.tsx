"use client";

import { forwardRef, useRef } from "react";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import type { RaaydrAudience } from "@/components/PageSpectraNoise";
import styles from "./HeroCallout.module.css";

/**
 * A full-bleed emotional callout: a large heading + short body sitting over the
 * same WebGL2 animated gradient that powers the homepage's "People are the
 * algorithm" beat (components/ui/animated-gradient.tsx), tinted to the page's
 * audience colour rather than the homepage's violet.
 *
 * The heavy WebGL context is only mounted while `active` is true. The parent
 * owns a single IntersectionObserver on this section and, from that same
 * boolean, unmounts the page's PageSpectraNoise — so the callout gradient and
 * PageSpectraNoise are never both live at once (only one heavy WebGL context
 * per page at any moment). Under reduced motion a static gradient stands in and
 * no WebGL context is created at all.
 */

type HeroCalloutProps = {
  /** Only used to give the section a stable id for aria-labelledby. */
  audience: RaaydrAudience;
  /** The page's canonical audience colour (the same token the halo, points and
   *  PageSpectraNoise key off) — drives the gradient's accent wash so the
   *  shader colour always matches the audience. */
  color: string;
  heading: string;
  /** A single paragraph, or several rendered in sequence. */
  body: string | string[];
  /** A closing line set in bold after the body. */
  boldNote?: string;
  /** Whether the section is on screen — gates the WebGL context. Controlled by
   *  the parent so PageSpectraNoise can be unmounted from the same signal. */
  active: boolean;
};

const HeroCallout = forwardRef<HTMLElement, HeroCalloutProps>(function HeroCallout(
  { audience, color, heading, body, boldNote, active },
  ref
) {
  const reducedMotion = usePrefersReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useMaskedReveal(headingRef);
  useReveal(bodyRef);

  const accent = color;
  const paragraphs = Array.isArray(body) ? body : [body];

  return (
    <section
      ref={ref}
      className={styles.callout}
      style={{ "--callout-accent": accent } as React.CSSProperties}
      aria-labelledby={`callout-${audience}`}
    >
      <div className={styles.gradientLayer} aria-hidden="true">
        {reducedMotion || !active ? (
          <div className={styles.gradientFallback} />
        ) : (
          <AnimatedGradient
            config={{
              // Mirrors the proven homepage config (see GradientSpan): a soft
              // periodic "Checks" wash over the canvas base, swapping the
              // homepage's violet for this page's audience accent.
              preset: "custom",
              color1: "#F5F2EC", // canvas — dominant base
              color2: accent, // audience colour, soft wash
              color3: "#F5F2EC", // canvas again — keeps it two-tone
              rotation: 20,
              proportion: 28,
              scale: 0.7,
              speed: 6,
              distortion: 10,
              swirl: 30,
              swirlIterations: 6,
              softness: 100,
              offset: 0,
              shape: "Checks",
              shapeSize: 32,
            }}
            noise={{ opacity: 0.04 }}
          />
        )}
      </div>

      <div className={`container ${styles.inner}`}>
        <h2
          ref={headingRef}
          id={`callout-${audience}`}
          className={`display-section ${styles.heading}`}
        >
          {heading}
        </h2>
        <div ref={bodyRef} className={styles.body}>
          {paragraphs.map((para) => (
            <p key={para} data-reveal>
              {para}
            </p>
          ))}
          {boldNote && (
            <p className={styles.boldNote} data-reveal>
              {boldNote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
});

export default HeroCallout;

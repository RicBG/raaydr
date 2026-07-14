"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import styles from "./GradientSpan.module.css";

/**
 * Wraps the "People are the algorithm" banner section in a continuous
 * background layer, rather than scoping the gradient to a boxed-in
 * container within it. No fixed height — the wrapper is just a positioning
 * context, so it stretches to the section's natural height and ends there;
 * it does not bleed into the sections before or after.
 */
export default function GradientSpan({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const gradient = gradientRef.current;
    if (!wrapper || !gradient) return;

    const mm = gsap.matchMedia();

    // Same easing/duration as the site's standard one-shot reveal (see
    // Problem.tsx's counterBody, RealNumbers' body reveal): power3.out,
    // 0.8s. Trigger point is earlier than that convention on purpose —
    // "top 100%" fires the instant the wrapper's top edge touches the
    // bottom of the viewport, so there's no dead gap after the hero before
    // the gradient starts appearing.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        gradient,
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: wrapper, start: "top 100%" },
        }
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(gradient, { opacity: 1, scale: 1 });
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={gradientRef} className={styles.gradientLayer} aria-hidden="true">
        {reducedMotion ? (
          <div className={styles.gradientFallback} />
        ) : (
          <AnimatedGradient
            config={{
              // Custom rather than the "Raaydr" preset: that preset uses
              // "Edge", a shape driven by a linear (non-periodic) position
              // threshold. Over a long enough dwell the time-based swirl
              // drifts it past the soft-edge zone and it saturates to a
              // flat single colour permanently. "Checks" is periodic
              // (sin/cos-based) so it oscillates forever and can never
              // settle into a solid fill. Canvas + violet only — no green.
              preset: "custom",
              color1: "#F5F2EC", // canvas — stays the dominant base
              color2: "#8C7AE6", // violet, soft wash
              color3: "#F5F2EC", // canvas again, not green — keeps it two-tone
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
      {children}
    </div>
  );
}

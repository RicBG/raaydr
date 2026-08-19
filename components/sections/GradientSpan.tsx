"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, type ReactNode } from "react";
import LazyMount from "@/components/LazyMount";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./GradientSpan.module.css";

// Code-split the WebGL gradient out of the initial bundle (below the fold).
const AnimatedGradient = dynamic(
  () => import("@/components/ui/animated-gradient").then((m) => m.AnimatedGradient),
  { ssr: false }
);

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
        {/* The static wash is always painted, underneath the live gradient
            rather than instead of it. The shader is opaque, so when it is
            running this is invisible; it only shows through in the cases where
            the canvas has nothing to show — before LazyMount has mounted it,
            in the frame or two after it remounts on the way back up, if the
            phone takes the GL context away, and under reduced motion. Any of
            those used to leave the section's background missing. */}
        <div className={styles.gradientFallback} />
        {!reducedMotion && (
          /* eager + persistent: created once at page load, never torn down —
             the lifecycle this gradient had for its whole life before the
             optimisation pass, which is the era when phones scrolled this
             page without dying. Putting it behind an unmounting LazyMount
             moved the WebGL2 context creation and shader compile into the
             scroll path, and on an iPhone that is a main-thread stall of
             seconds landing at the exact moment the section arrives — "the
             background loaded in and it stopped." The mount guard, the
             context-loss fallback and the wash underneath all stay; the
             render gate parks the loop off-screen, so what persists is a
             dormant context, not work. */
          <LazyMount eager persistent style={{ position: "absolute", inset: 0 }}>
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
              /* The component's own fallback is a green wash, which is the
                 wrong colour for this section. The static violet layer above
                 is already underneath, so on failure the canvas paints
                 nothing and that shows through. */
              fallback={null}
            />
          </LazyMount>
        )}
      </div>
      {children}
    </div>
  );
}

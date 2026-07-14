"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Depth parallax for decorative layers. `speed` is relative to scroll:
 * 1.15 runs ahead (rises faster), 0.85 lags behind, 0.95 drifts gently.
 * Small offsets only — nothing should swim. No-op under reduced motion.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  speed: number,
  range = 240
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const shift = (1 - speed) * range;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { y: -shift },
        {
          y: shift,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

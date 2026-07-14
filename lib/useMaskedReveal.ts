"use client";

import { useEffect, type RefObject } from "react";
import { gsap, SplitText } from "@/lib/gsap";

type MaskedRevealOptions = {
  /** "lines" for headlines and statements, "chars" for the footer wordmark. */
  type?: "lines" | "chars";
  /** Play on mount instead of waiting for a scroll trigger (hero). */
  immediate?: boolean;
  delay?: number;
};

/**
 * The masked line reveal: text rises out of an overflow mask, 0.9s
 * power4.out, staggered. Applied to every headline sitewide. Splitting waits
 * for fonts so line breaks are measured against the real metrics. Reduced
 * motion collapses to a 0.3s fade.
 */
export function useMaskedReveal(
  ref: RefObject<HTMLElement | null>,
  { type = "lines", immediate = false, delay = 0 }: MaskedRevealOptions = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let split: SplitText | null = null;
      let tween: gsap.core.Tween | null = null;
      let cancelled = false;

      // Hide until fonts are ready and the split runs, so nothing flashes
      // unsplit and nothing "simply appears".
      gsap.set(el, { visibility: "hidden" });

      document.fonts.ready.then(() => {
        if (cancelled) return;
        split = SplitText.create(el, { type, mask: type });
        gsap.set(el, { visibility: "visible" });
        const targets = type === "chars" ? split.chars : split.lines;
        tween = gsap.from(targets, {
          yPercent: 110,
          duration: 0.9,
          ease: "power4.out",
          stagger: type === "chars" ? 0.035 : 0.09,
          delay,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: el, start: "top 78%" } }),
        });
      });

      return () => {
        cancelled = true;
        tween?.scrollTrigger?.kill();
        tween?.kill();
        split?.revert();
        gsap.set(el, { clearProps: "visibility" });
      };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: el, start: "top 85%" } }),
        }
      );
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Body-copy reveal: elements marked [data-reveal] inside the scope rise 24px
 * with a fade, staggered 0.08s. Headlines never use this — they get the
 * masked line reveal. Under reduced motion this collapses to a 0.3s fade.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll("[data-reveal]"));
    if (targets.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        targets,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 78%" },
        }
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.fromTo(
        targets,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    return () => mm.revert();
  }, [scope]);
}

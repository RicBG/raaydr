"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollBus } from "@/lib/scrollBus";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // native scrolling; ScrollTrigger works against it directly
    }

    const lenis = new Lenis({ lerp: 0.1 });

    lenis.on("scroll", () => {
      scrollBus.velocity = lenis.velocity;
      ScrollTrigger.update();
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
      // Lenis only emits scroll while moving; decay the bus when idle.
      scrollBus.velocity = lenis.velocity;
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Same-page hash links (nav CTA, footer) scroll through Lenis; a native
    // jump would be fought by its animation loop.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href*="#"]'
      );
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector<HTMLElement>(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -20 });
    };
    document.addEventListener("click", onClick);

    window.__lenis = lenis;

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
      scrollBus.velocity = 0;
    };
  }, []);

  return <>{children}</>;
}

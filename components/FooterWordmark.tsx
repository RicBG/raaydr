"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Footer wordmark: the light SVG mark (green blip included, never cropped),
 * rising out of an overflow mask when the footer enters. Reduced motion
 * collapses to a 0.3s fade.
 */
export default function FooterWordmark({ className }: { className?: string }) {
  const maskRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mask = maskRef.current;
    const img = mask?.firstElementChild;
    if (!mask || !img) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(img, {
        yPercent: 110,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: { trigger: mask, start: "top 85%" },
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.fromTo(
        img,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          scrollTrigger: { trigger: mask, start: "top 90%" },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <span ref={maskRef} className={className} style={{ display: "block", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/raaydr-wordmark-blip-light.svg"
        alt="RAAYDR"
        style={{ display: "block", height: "clamp(26px, 3vw, 36px)", width: "auto" }}
      />
    </span>
  );
}

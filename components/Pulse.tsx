"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import styles from "./Pulse.module.css";

type PulseProps = {
  /** The section's accent colour — only ever seen blurred, at low opacity. */
  color?: string;
  className?: string;
};

/**
 * Section entry pulse: a 1px ring in the section's accent colour expands
 * from centre and fades over 1.2s on first entry, once per section. Never
 * on mobile, never under reduced motion.
 */
export default function Pulse({ color = "var(--green)", className }: PulseProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
      () => {
        const trigger = ScrollTrigger.create({
          trigger: el.parentElement ?? el,
          start: "top 65%",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              el,
              { scale: 0.15, opacity: 0.35 },
              {
                scale: 2.6,
                opacity: 0,
                duration: 1.2,
                ease: "power2.out",
                overwrite: true,
              }
            );
          },
        });
        return () => trigger.kill();
      }
    );
    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.pulse} ${className ?? ""}`}
      style={{ borderColor: color }}
      aria-hidden="true"
    />
  );
}

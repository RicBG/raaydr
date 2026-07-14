"use client";

import { useEffect, useRef } from "react";
import { scrollBus } from "@/lib/scrollBus";
import styles from "./Ring.module.css";

/**
 * The disc is rendered at half size and upscaled 2x in the transform: the
 * composited result is the same heavy gaussian at a quarter of the blur
 * pixels. Every animation below is transform-only — filter and size never
 * change after first paint.
 */
const BASE_UPSCALE = 2;
/** Idle spin ≈ 0.045deg per 60fps frame — one revolution roughly every 2¼min
 *  of idle, rising sharply with scroll velocity. */
const IDLE_DEG_PER_FRAME = 0.045;
const MAX_BOOST = 1.8;
const BOOST_DECAY = 0.94;

type RingProps = {
  /**
   * "spectrum": the five-colour rotating ring (hero, closing CTA).
   * "halo": single colour radial glow — no rotation, but it keeps the
   *   breathing scale so silhouette halos feel alive. Colour comes from the
   *   CSS variable --halo-color on an ancestor so GSAP can tween it.
   */
  mode?: "spectrum" | "halo";
  className?: string;
};

export default function Ring({ mode = "spectrum", className }: RingProps) {
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // static: the CSS transform already applies the upscale
    }

    let rot = 0;
    let boost = 0;
    let last = performance.now();
    let frame = 0;

    const tick = (t: number) => {
      const frames = Math.min((t - last) / (1000 / 60), 3); // dt in 60fps frames
      last = t;

      const breathe = 1 + Math.sin(t / 2600) * 0.045;
      const scale = BASE_UPSCALE * breathe;

      if (mode === "spectrum") {
        // Scroll velocity boosts the spin, then decays back to idle.
        const target = Math.min(Math.abs(scrollBus.velocity) * 0.12, MAX_BOOST);
        boost = Math.max(boost * Math.pow(BOOST_DECAY, frames), target);
        rot = (rot + (IDLE_DEG_PER_FRAME + boost) * frames) % 360;
        disc.style.transform = `rotate(${rot}deg) scale(${scale})`;
      } else {
        disc.style.transform = `scale(${scale})`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  return (
    <div className={`${styles.wrap} ${className ?? ""}`} aria-hidden="true">
      <div
        ref={discRef}
        className={mode === "halo" ? styles.halo : styles.ring}
      />
    </div>
  );
}

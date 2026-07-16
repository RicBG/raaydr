"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./OrbParticles.module.css";

const COUNT = 16;

/** Deterministic pseudo-random so server and client markup match. */
function seeded(seed: number) {
  const x = Math.sin(seed * 999.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function OrbParticles() {
  const reducedMotion = usePrefersReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        // Scatter within the halo's circle, not its bounding square. Rounded
        // to 2dp: the server and client otherwise re-serialize the same
        // float to slightly different decimal strings, which React reports
        // as a hydration mismatch.
        const round = (n: number) => Math.round(n * 100) / 100;
        const angle = seeded(i * 2 + 1) * Math.PI * 2;
        const radius = Math.sqrt(seeded(i * 2 + 2)) * 46;
        const size = 2 + seeded(i * 3.1) * 3;
        return {
          left: round(50 + Math.cos(angle) * radius),
          top: round(50 + Math.sin(angle) * radius),
          size: round(size),
          duration: round(6 + seeded(i * 5.3) * 5),
          delay: round(seeded(i * 7.7) * -10),
          drift: round(10 + seeded(i * 4.2) * 14),
        };
      }),
    []
  );

  if (reducedMotion) return null;

  return (
    <div className={styles.field} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className={styles.particle}
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              "--duration": `${p.duration}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

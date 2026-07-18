"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import RaaydrOrb from "@/components/RaaydrOrb";

type LazyOrbProps = ComponentProps<typeof RaaydrOrb> & {
  /** Grow the observed box so the orb mounts just before it scrolls into view. */
  rootMargin?: string;
};

/**
 * Mounts a RaaydrOrb — a live WebGL context — only while its box is on screen,
 * and unmounts it (RaaydrOrb's cleanup calls loseContext) the moment it scrolls
 * away. The homepage has two orbs, the hero and the closing CTA, sitting at
 * opposite ends of a very long page, so they are never on screen at the same
 * time. Gating each one this way means only a single orb GL context is ever
 * alive, which a prior performance pass flagged as the scroll-jank risk of
 * running multiple simultaneous contexts.
 */
export default function LazyOrb({
  rootMargin = "200px",
  ...orbProps
}: LazyOrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {inView && <RaaydrOrb {...orbProps} />}
    </div>
  );
}

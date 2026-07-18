"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type LazyMountProps = {
  children: ReactNode;
  /** Grow the observed box so the content mounts just before it scrolls in. */
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Renders its children only while its box is on screen, and unmounts them the
 * moment it scrolls away. Used to wrap the heavy WebGL surfaces (the hero Orb
 * and the closing metaball field): each frees its GL context on unmount, and
 * because the two sit at opposite ends of a very long page they are never on
 * screen together, so only a single heavy context is ever alive. A prior
 * performance pass flagged multiple simultaneous contexts as the scroll-jank
 * risk.
 */
export default function LazyMount({
  children,
  rootMargin = "200px",
  className,
  style,
}: LazyMountProps) {
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
    <div ref={ref} className={className} style={style}>
      {inView && children}
    </div>
  );
}

"use client";

// ScrollTicker: an infinite horizontal marquee that reacts to scroll. Scroll
// down moves it in the initial direction; scroll up reverses it; scroll
// velocity boosts the speed and eases back. Adapted from a Framer component,
// built fresh for this stack: the Framer runtime (addPropertyControls,
// useIsStaticRenderer) and framer-motion's useInView are removed. In view is
// tracked with an IntersectionObserver, and the whole thing goes still under
// prefers-reduced-motion. All animation state lives in refs so frames never
// trigger a React re-render.

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type TickerDirection = "left" | "right";

type ScrollTickerProps = {
  children?: ReactNode;
  /** Base scroll speed in pixels per second. */
  baseSpeed?: number;
  /** Default travel direction; reverses when the user scrolls the other way. */
  initialDirection?: TickerDirection;
  /** Space between items. */
  gap?: number;
  /** Background of the ticker band. */
  background?: string;
  /** How much scroll velocity accelerates the ticker. 0 is none, 3 is max. */
  boostIntensity?: number;
  paddingX?: number;
  paddingY?: number;
  className?: string;
  style?: CSSProperties;
};

export default function ScrollTicker({
  children,
  baseSpeed = 80,
  initialDirection = "left",
  gap = 24,
  background = "transparent",
  boostIntensity = 1,
  paddingX = 16,
  paddingY = 8,
  className,
  style,
}: ScrollTickerProps) {
  const reduced = usePrefersReducedMotion();

  // Mutable animation state in refs so per frame work never re-renders React.
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const directionRef = useRef<TickerDirection>(initialDirection);
  const velocityRef = useRef(1);
  const lastTimeRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number | null>(null);
  const inViewRef = useRef(false);

  // Dynamic replication so the track is always wider than the container and
  // the loop stays seamless no matter how few or small the children are.
  const [copies, setCopies] = useState(2);

  const measureAndReplicate = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const containerWidth = container.offsetWidth;
    if (containerWidth <= 0) return;

    const singleCopyWidth = track.scrollWidth / copies;
    if (singleCopyWidth <= 0) return;

    const needed = Math.max(
      2,
      Math.ceil((containerWidth * 2) / singleCopyWidth) + 1
    );
    if (needed !== copies) setCopies(needed);
  }, [copies]);

  useEffect(() => {
    measureAndReplicate();
    const ro = new ResizeObserver(measureAndReplicate);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measureAndReplicate, children, gap]);

  // Track visibility so the loop can idle off screen.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((e) => e.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0.1 }
    );
    io.observe(container);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    directionRef.current = initialDirection;
  }, [initialDirection]);

  // Scroll listener: direction plus a velocity boost. Skipped under reduced
  // motion so the ticker holds still. Passive, so it coexists with Lenis
  // (which also reads wheel) without a second scroll loop.
  useEffect(() => {
    if (reduced) return;

    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY;
      const next: TickerDirection =
        dy > 0
          ? initialDirection
          : dy < 0
            ? initialDirection === "left"
              ? "right"
              : "left"
            : directionRef.current;
      directionRef.current = next;

      const absDelta = Math.min(Math.abs(dy), 200);
      const intensity = Math.max(0, boostIntensity);
      velocityRef.current = 1 + (absDelta / 200) * intensity;
      lastScrollTimeRef.current = performance.now();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [reduced, boostIntensity, initialDirection]);

  // Animation loop. Runs entirely through refs and direct DOM transforms.
  useEffect(() => {
    if (reduced) return;

    const step = (timestamp: number) => {
      const track = trackRef.current;
      if (!track) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      if (!inViewRef.current) {
        lastTimeRef.current = null;
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      const prev = lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (prev != null) {
        const deltaSec = (timestamp - prev) / 1000;
        const dir = directionRef.current === "left" ? -1 : 1;

        // Ease velocity back to 1 once scrolling stops.
        let velocity = velocityRef.current;
        if (lastScrollTimeRef.current != null) {
          const elapsed = timestamp - lastScrollTimeRef.current;
          if (elapsed > 100) {
            const t = Math.min((elapsed - 100) / 400, 1);
            velocity = 1 + (velocity - 1) * (1 - t);
            if (t >= 1) {
              velocity = 1;
              velocityRef.current = 1;
              lastScrollTimeRef.current = null;
            } else {
              velocityRef.current = velocity;
            }
          }
        }

        positionRef.current += dir * baseSpeed * velocity * deltaSec;

        // Wrap the position so the loop is seamless in both directions.
        const singleCopyWidth = track.scrollWidth / copies;
        if (singleCopyWidth > 0) {
          while (positionRef.current <= -singleCopyWidth) {
            positionRef.current += singleCopyWidth;
          }
          while (positionRef.current > 0) {
            positionRef.current -= singleCopyWidth;
          }
        }

        track.style.transform = `translateX(${positionRef.current}px)`;
      }

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [baseSpeed, reduced, copies]);

  const strip = children ? (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        gap,
        whiteSpace: "nowrap",
        paddingRight: gap,
      }}
    >
      {children}
    </div>
  ) : null;

  const strips: ReactNode[] = [];
  for (let i = 0; i < copies; i++) {
    strips.push(<div key={i} style={{ display: "contents" }}>{strip}</div>);
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        background,
        padding: `${paddingY}px ${paddingX}px`,
        ...style,
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {strips}
      </div>
    </div>
  );
}

"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * If the mounted surface throws, drop it — not the page. This app has no
 * other error boundary, so before this existed a render or effect error in
 * any lazy-mounted canvas unmounted the entire React tree, and the recovery
 * re-render reset the scroll position to the top of the page: exactly the
 * "section loads, unloads, and I'm back at the top" report from iOS, where
 * WebGL setup is flakiest. Every LazyMount user paints a static layer
 * underneath its surface, so rendering nothing here degrades to the designed
 * fallback rather than a hole.
 */
class MountGuard extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("LazyMount surface failed, dropping it:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type LazyMountProps = {
  children: ReactNode;
  /** Grow the observed box so the content mounts just before it scrolls in. */
  rootMargin?: string;
  /** Mount immediately instead of waiting for the observer to report the box
   *  on screen. For content that is above the fold on load, where the observer
   *  round trip only delays the mount: the hero orb sits in the first
   *  viewport, so waiting for hydration and then an IntersectionObserver
   *  callback before even fetching its chunk costs a whole round trip for a
   *  box that was always visible. Unmount-on-scroll-away still applies, so the
   *  GL context is still freed. */
  eager?: boolean;
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
  eager = false,
  className,
  style,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(eager);

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
      {inView && <MountGuard>{children}</MountGuard>}
    </div>
  );
}

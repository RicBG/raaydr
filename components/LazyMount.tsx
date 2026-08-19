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
  /** Once mounted, stay mounted. Unmount-on-scroll-away frees a GL context,
   *  but it also means the context is REBUILT mid-scroll every time the box
   *  comes back — and on an iPhone, creating a WebGL context and compiling
   *  its shaders is a main-thread stall measured in seconds, landing at the
   *  exact moment the section arrives. That churn is what kept killing the
   *  page at "People are the algorithm": the gradient there had been created
   *  once at page load for its whole life (the era everything worked), and
   *  moving it behind an unmounting LazyMount relocated its most expensive
   *  moment into the scroll path. Persistent surfaces pay their setup once;
   *  their render loops are still parked off-screen by createRenderGate, so
   *  staying mounted costs a dormant context, not frames. */
  persistent?: boolean;
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
  persistent = false,
  className,
  style,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(eager);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // A persistent box that is already mounted has nothing left to observe.
    if (persistent && eager) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.some((e) => e.isIntersecting);
        if (persistent) {
          // Latch: raise once, never lower, and stop watching.
          if (seen) {
            setInView(true);
            io.disconnect();
          }
        } else {
          setInView(seen);
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, persistent, eager]);

  return (
    <div ref={ref} className={className} style={style}>
      {inView && <MountGuard>{children}</MountGuard>}
    </div>
  );
}

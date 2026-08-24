"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
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
   *  GL context is still freed.
   *
   *  This skips the observer, not the load gate above: an eager box mounts as
   *  soon as the page has loaded, without waiting to be told it is on screen,
   *  and not before. */
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
 * Has the page finished loading? One signal, shared by every LazyMount.
 *
 * A module-level store rather than per-instance state: the page loads once, so
 * five instances asking the same question should not mean five listeners and
 * five renders. Read through useSyncExternalStore so the answer is derived
 * rather than written into state from an effect, and so the server snapshot is
 * always false — the markup React hydrates against never contains a surface.
 *
 * The timeout is a floor, not an optimisation: `load` waits on every
 * subresource, and one stalled request would otherwise strand these surfaces
 * for the whole session.
 */
const PAGE_LOAD_FLOOR_MS = 8000;
let pageLoaded = false;
const pageLoadWaiters = new Set<() => void>();

function markPageLoaded() {
  if (pageLoaded) return;
  pageLoaded = true;
  for (const notify of pageLoadWaiters) notify();
  pageLoadWaiters.clear();
}

if (typeof window !== "undefined") {
  if (document.readyState === "complete") {
    pageLoaded = true;
  } else {
    window.addEventListener("load", markPageLoaded, { once: true });
    window.setTimeout(markPageLoaded, PAGE_LOAD_FLOOR_MS);
  }
}

function subscribePageLoaded(notify: () => void) {
  if (pageLoaded) return () => {};
  pageLoadWaiters.add(notify);
  return () => {
    pageLoadWaiters.delete(notify);
  };
}

const getPageLoaded = () => pageLoaded;
const getPageLoadedOnServer = () => false;

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
  // Nothing heavy is built while the page is still loading.
  //
  // Creating a WebGL context and compiling its shaders is, on an iPhone, a
  // main-thread stall measured in seconds (see `persistent` below). Doing that
  // during load puts it alongside everything else the phone is already doing:
  // parsing the bundle, hydrating, laying out seventeen thousand pixels,
  // decoding images. Timed on the homepage at 390x844, scrolling down without
  // waiting for load, three contexts were created and one destroyed inside the
  // first 3.3 seconds — two of them within 70ms of each other, both eager, both
  // for surfaces the reader had already left by the time they finished.
  //
  // Waiting for `load` costs the eager surfaces a beat on a normal visit, which
  // is the trade: every LazyMount user paints a static layer underneath, so the
  // interval shows the designed fallback rather than a hole. The intent is that
  // a reader who flicks straight down never pays for the top of the page at all,
  // because by the time load fires the observer has already reported those boxes
  // gone.
  //
  // Be careful what you claim for this. It is the right shape — setup should not
  // compete with load — but it has NOT been shown to reduce context count or
  // main-thread blocking. Measured against the unfixed build it moved neither
  // reliably, and under network throttling the two ran level or the gated build
  // created contexts the ungated one had skipped, because deferring the dynamic
  // import to after load lets it arrive on uncontended bandwidth. The one thing
  // that is certain is the ordering. If this is ever revisited, measure on a
  // real phone: none of the above reproduces an iOS crash, which is what it was
  // written for.
  const loaded = useSyncExternalStore(
    subscribePageLoaded,
    getPageLoaded,
    getPageLoadedOnServer
  );

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
      {inView && loaded && <MountGuard>{children}</MountGuard>}
    </div>
  );
}

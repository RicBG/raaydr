"use client";

import { useSyncExternalStore } from "react";

const WIDE = "(min-width: 768px)";
const MOTION_OK = "(prefers-reduced-motion: no-preference)";

function subscribe(callback: () => void) {
  const wide = window.matchMedia(WIDE);
  const motion = window.matchMedia(MOTION_OK);
  wide.addEventListener("change", callback);
  motion.addEventListener("change", callback);
  return () => {
    wide.removeEventListener("change", callback);
    motion.removeEventListener("change", callback);
  };
}

/**
 * Whether this device should run a live WebGL surface at all.
 *
 * The homepage grew four of them — the hero orb, the algorithm gradient, the
 * closing liquid field and the dot field behind the waitlist — each one behind
 * LazyMount so that only the surface on screen holds a context. That is the
 * right answer on a laptop and the wrong question on a phone: scrolling the
 * page tears a GL context down and stands another one up several times over,
 * and a phone under memory pressure answers by taking the context away
 * mid-scroll or by killing the tab. Which is what it was doing.
 *
 * So phones do not get a live shader. Every one of these surfaces already has
 * a static CSS or image stand-in built for reduced motion, and those stand-ins
 * are the mobile design rather than a degraded one: the hero orb's is the
 * gradient that already paints with the document, and the closing field's is a
 * still render of the same shader. FirstWave has gated itself this way from
 * the start; this is that rule, shared, applied to the rest.
 *
 * Renders false on the server and on the first client paint, so the static
 * version is what SSR emits and hydration never has to swap a canvas in and
 * out. Both conditions are tracked live, so resizing a desktop window narrow
 * gives up the shader and widening it takes it back.
 */
export function useLiveShader(): boolean {
  return useSyncExternalStore(
    subscribe,
    () =>
      window.matchMedia(WIDE).matches && window.matchMedia(MOTION_OK).matches,
    () => false
  );
}

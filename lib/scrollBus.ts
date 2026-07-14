/**
 * Shared scroll state, written by the Lenis provider each frame and read by
 * the Ring's rAF loop. A plain mutable object avoids re-rendering React on
 * every scroll tick.
 */
export const scrollBus = {
  /** Lenis velocity, roughly px per frame. 0 when idle. */
  velocity: 0,
};

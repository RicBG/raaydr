// A render gate for continuous WebGL/rAF loops. Reports when an element is
// BOTH on-screen (IntersectionObserver) AND in a visible tab
// (visibilitychange) so a component can pause its render loop the rest of the
// time. The homepage alone runs two always-on WebGL canvases (the hero Orb
// and the animated gradient behind the Algorithm section); left ungated they
// keep rendering at 60fps while scrolled far past, competing for the GPU
// during scroll. This is the single biggest lever on the measured jank.
//
// Usage:
//   const stop = createRenderGate(el, startRaf, stopRaf);
//   // ...later, on cleanup:
//   stop();
//
// onActive fires when the element becomes visible (and stays hidden until the
// IntersectionObserver's first async callback, so a loop never renders a frame
// before we know it's actually on-screen). onInactive fires when it leaves the
// viewport or the tab is backgrounded.
export function createRenderGate(
  el: Element,
  onActive: () => void,
  onInactive: () => void
): () => void {
  let onScreen = false;
  let tabVisible =
    typeof document === "undefined" || document.visibilityState !== "hidden";
  let active = false;

  const evaluate = () => {
    const next = onScreen && tabVisible;
    if (next === active) return;
    active = next;
    if (active) onActive();
    else onInactive();
  };

  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      evaluate();
    },
    { threshold: 0 }
  );
  io.observe(el);

  const onVisibility = () => {
    tabVisible = document.visibilityState !== "hidden";
    evaluate();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

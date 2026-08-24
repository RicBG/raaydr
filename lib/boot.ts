/**
 * The first-load curtain.
 *
 * Everything that makes the homepage expensive — six web fonts, React
 * hydration, GSAP, and the WebGL surfaces created at page load — lands in the
 * same few seconds, and on a phone on mobile data it lands *after* the reader
 * has already started scrolling. Two things go wrong when it does.
 *
 * The page moves under them. Sections that upgrade themselves on hydration
 * change height when they do, and `body` sets `overflow-anchor: none` (the
 * pinned ScrollTriggers need it), so the browser does not compensate: the
 * scroll offset stays where it was and the content slides down past it. The
 * worst of these is fixed at source — see MOTION_ATTR below, which reserves the
 * pledge timeline's height so it never changes at all — but the curtain is what
 * covers the rest, and what covers a reload part-way down the page.
 *
 * And the heavy setup stalls the main thread mid-scroll. Creating a WebGL
 * context and compiling its shaders is, on an iPhone, a stall measured in
 * seconds. Behind a curtain that costs nothing. In the scroll path it is the
 * jank — which is why MidWave's dot field is now built at load rather than on
 * approach.
 *
 * So: hold the reader at the top, on a screen that is one inline SVG and three
 * CSS gradients, until the page has stopped moving. Then lift.
 *
 * This runs in <head>, before first paint, for the same reason
 * JOINED_PREPAINT_SCRIPT does — a curtain that arrives after hydration has
 * missed the entire window it exists to cover. It is deliberately plain script
 * and not React: hydration being slow is half of what it is covering, so it
 * cannot be the thing that dismisses it.
 *
 * Four properties are load bearing.
 *
 * It is opt-in from script. The markup is `display: none` until this sets
 * `data-booting`, so a visitor with no JavaScript never meets an opaque panel
 * with nothing behind it to remove it.
 *
 * It can always be escaped. The hard timeout below is not a tuning knob, it is
 * the guarantee: a stalled subresource, a `load` that never fires, a font file
 * that 404s — none of them can strand anyone. Whatever happens, the curtain is
 * gone by then.
 *
 * And it takes the attribute back off rather than taking the node out. The
 * curtain is server-rendered markup that React owns, and on a slow connection
 * this script finishes long before hydration does — removing the element from
 * under React produced a hydration mismatch (error #418), React rebuilt the
 * element anyway, and a mismatch that forces a client re-render of the whole
 * tree is the same failure that used to throw readers back to the top of the
 * page. So the DOM is left exactly as it was served: dropping the attribute
 * returns `.boot` to its `display: none` resting state, which costs nothing to
 * keep and nothing to leave behind.
 *
 * And it defers to the signup cover. A role page opened with the joined flag
 * already stamps `data-joined` and paints its own cover for its own reasons;
 * two covers on one paint is one too many, so this one stands down.
 *
 * It also carries a second, unrelated stamp — `data-motion` — for the same
 * reason it is in <head>: something has to be known before first paint. See
 * MOTION_ATTR below.
 */

/**
 * `data-motion="on"` on <html> means: this document will run its scroll-driven
 * sequences. JavaScript is on (nothing else sets this) and the reader has not
 * asked for reduced motion.
 *
 * It exists so CSS can reserve the height those sequences will take before
 * their effects have run. The pledge timeline is the case that made it
 * necessary: served, it is a 547px swipe rail on a phone, and the moment its
 * effect upgrades it to a scroll-driven sticky sequence it becomes four
 * viewports — 2680px, measured. Everything below it moves down by 2133px, and
 * because `body` sets `overflow-anchor: none` the browser does not compensate,
 * so a reader who has already started scrolling is shoved that far back toward
 * the top of the page. That is the "it drags you back up" report.
 *
 * A media query alone cannot answer this, because the other half of the
 * question is whether script will run at all: a visitor with no JavaScript
 * keeps the rail and must keep the rail's height with it. So it is stamped
 * here, from script, before anything is painted.
 */
export const MOTION_ATTR = "data-motion";

/** Shortest time the curtain stays up, so a warm load does not flash it. */
export const MIN_MS = 600;
/** Longest it can stay up, whatever else is or is not finished. */
export const MAX_MS = 3800;
/** How long the fade-out runs; must match the transition in globals.css. */
export const FADE_MS = 500;
/** Ceiling on the wait for an idle frame once the page has loaded. */
export const IDLE_MS = 1200;

export const BOOT_PREPAINT_SCRIPT = `(function(){try{
var d=document,h=d.documentElement;
// Unconditional, and before the early return below: this says what the
// document will do, not what the curtain is doing.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)h.setAttribute('${MOTION_ATTR}','on');
if(h.getAttribute('data-joined')==='1')return;
h.setAttribute('data-booting','1');
var t0=Date.now(),done=false;
var lift=function(){
if(done)return;done=true;
h.setAttribute('data-booting','0');
// Attribute only — never touch the node itself. See the note above.
setTimeout(function(){h.removeAttribute('data-booting')},${FADE_MS});
};
var hard=setTimeout(lift,${MAX_MS});
var settle=function(){
setTimeout(function(){
var go=function(){clearTimeout(hard);lift();};
// An idle callback is the signal that the eager WebGL surfaces have finished
// their setup: it cannot be served while the main thread is still blocked by
// one. Waiting for it is what puts that stall behind the curtain rather than
// in the reader's first scroll.
if(typeof requestIdleCallback==='function')requestIdleCallback(go,{timeout:${IDLE_MS}});
else setTimeout(go,200);
},Math.max(0,${MIN_MS}-(Date.now()-t0)));
};
var ready=function(){
var f=d.fonts&&d.fonts.ready;
if(f&&f.then)f.then(settle,settle);else settle();
};
if(d.readyState==='complete')ready();
else addEventListener('load',ready,{once:true});
}catch(e){try{document.documentElement.removeAttribute('data-booting')}catch(e2){}}})();`;

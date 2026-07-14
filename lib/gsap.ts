import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Mobile Safari resizes the viewport as its address bar collapses/expands
  // on scroll; without this, ScrollTrigger treats that as a real resize and
  // recalculates trigger positions mid-scroll, which can leave elements
  // stuck at their initial (invisible) state — e.g. the "Find your place"
  // silhouettes never revealing on iOS.
  ScrollTrigger.config({ ignoreMobileResize: true });
  // Dev affordance: lets tests drive frames manually when rAF is throttled.
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __gsap: typeof gsap }).__gsap = gsap;
  }
}

export { gsap, ScrollTrigger, SplitText };

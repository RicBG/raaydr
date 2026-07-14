import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Dev affordance: lets tests drive frames manually when rAF is throttled.
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __gsap: typeof gsap }).__gsap = gsap;
  }
}

export { gsap, ScrollTrigger, SplitText };

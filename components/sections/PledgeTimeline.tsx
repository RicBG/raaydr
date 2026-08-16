"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { PLEDGES, PLEDGE_HEADING } from "@/lib/pledges";
import styles from "./PledgeTimeline.module.css";

/**
 * The homepage pledge moment: a sticky frame whose panels wipe across each
 * other on scroll, one promise at a time.
 *
 * The wipe is a clip-path inset animated from a scroll progress value: the
 * outgoing panel is clipped from the right while the incoming one is revealed
 * from the same edge, so a single vertical seam travels right to left. The
 * outgoing panel's poster word rotates to -90deg about its bottom left corner
 * over the same progress, which is what makes the seam read as one panel
 * turning away rather than two panels cross fading.
 *
 * There are two moves over one mechanism. Wide screens wipe the seam
 * sideways, which needs width to read. Phones stack: each promise slides up
 * over the one before it and that one eases back and dims, so the thing
 * driving it is the vertical scroll the page already has rather than a
 * sideways swipe inside a page that scrolls down. Same sticky frame, same
 * scrub, same 0 to count - 1 progress; only the per panel move differs.
 *
 * The pinning is CSS `position: sticky`, not ScrollTrigger's pin. The homepage
 * already pins the How It Works wheel, and pin spacers are inserted and removed
 * on refresh; sticky keeps this section out of that entirely and leaves
 * ScrollTrigger doing nothing but reporting progress. Progress arrives through
 * Lenis, which calls ScrollTrigger.update() on every scroll frame, so this
 * stays in step with the rest of the page instead of running its own scroll
 * listener against a scroll position Lenis is still animating.
 *
 * The panels are plain blocks until the effect upgrades them, rather than
 * being clipped by default and unclipped by script. That way the promises are
 * readable with no JS, before hydration, and under reduced motion, where a
 * scroll driven sequence has no business running at all. That fallback is a
 * vertical stack on desktop and a horizontal snap rail on phones, both of
 * which are readable on their own terms.
 */
export default function PledgeTimeline() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const mm = gsap.matchMedia();

    // Both breakpoints run the same machine: one sticky frame, one scrub, one
    // progress value from 0 to count - 1. Only the move differs. Wide screens
    // wipe a vertical seam sideways, which needs width to read. Phones stack:
    // each promise slides up over the one before it and that one settles back,
    // so the gesture driving it is the vertical scroll the page already has,
    // rather than asking for a sideways swipe inside a page that scrolls down.
    const build = (axis: "wipe" | "stack") => () => {
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, wrap);
      const count = panels.length;
      if (count < 2) return;

      // `progress` runs 0 to count - 1, so its whole part is the panel
      // currently on screen and its fraction is that panel's transition.
      const applyAt = (progress: number) => {
        const scaled = gsap.utils.clamp(0, count - 1, progress);
        const current = Math.min(count - 2, Math.floor(scaled));
        const t = scaled - current;

        panels.forEach((panel, i) => {
          const word = panel.querySelector<HTMLElement>(`.${styles.word}`);
          const header = panel.querySelector<HTMLElement>(
            `.${styles.panelHeader}`
          );
          panel.style.zIndex = String(i);

          if (axis === "stack") {
            // Incoming card rises over the outgoing one, which eases back and
            // dims as it is covered. No clip and no word rotation: the seam and
            // the pivot are both devices for the sideways wipe, and neither
            // reads as anything but noise when the move is vertical.
            if (i === current) {
              panel.style.transform = `translate3d(0, ${-6 * t}%, 0) scale(${1 - 0.05 * t})`;
              panel.style.opacity = String(1 - 0.4 * t);
            } else if (i === current + 1) {
              panel.style.transform = `translate3d(0, ${(1 - t) * 100}%, 0)`;
              panel.style.opacity = "1";
            } else if (i < current) {
              panel.style.transform = "translate3d(0, -6%, 0) scale(0.95)";
              panel.style.opacity = "0";
            } else {
              panel.style.transform = "translate3d(0, 100%, 0)";
              panel.style.opacity = "1";
            }
            if (header) header.style.opacity = "1";
            if (word) word.style.transform = "";
            return;
          }

          if (i === current) {
            // Wiping out: keep the left (1 - t) of the panel.
            panel.style.clipPath = `inset(0 ${t * 100}% 0 0)`;
            if (word) word.style.transform = `rotate(${-90 * t}deg)`;
            // The word pivots up through the left column, straight across the
            // copy that also lives there. Fading the header out over the first
            // part of the wipe keeps the two from overlapping: you read the
            // promise while the panel rests, and see the graphic while it
            // turns. Reversible, so scrubbing back fades it in again.
            if (header) header.style.opacity = String(Math.max(0, 1 - t * 2.5));
          } else if (i === current + 1) {
            // Wiping in from the same seam: keep the right t of the panel.
            panel.style.clipPath = `inset(0 0 0 ${(1 - t) * 100}%)`;
            if (word) word.style.transform = "rotate(0deg)";
            if (header) header.style.opacity = "1";
          } else {
            panel.style.clipPath = "inset(0 0 0 100%)";
            // Panels already behind stay turned away, so scrubbing backwards
            // finds them mid rotation rather than snapped flat.
            if (word)
              word.style.transform =
                i < current ? "rotate(-90deg)" : "rotate(0deg)";
            if (header) header.style.opacity = i < current ? "0" : "1";
          }
        });
      };

      wrap.dataset.mode = "timeline";
      wrap.dataset.axis = axis;
      applyAt(0);

      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => applyAt(self.progress * (count - 1)),
      });

      return () => {
        trigger.kill();
        delete wrap.dataset.mode;
        delete wrap.dataset.axis;
        panels.forEach((panel) => {
          panel.style.clipPath = "";
          panel.style.zIndex = "";
          panel.style.transform = "";
          panel.style.opacity = "";
          const word = panel.querySelector<HTMLElement>(`.${styles.word}`);
          if (word) word.style.transform = "";
          const header = panel.querySelector<HTMLElement>(
            `.${styles.panelHeader}`
          );
          if (header) header.style.opacity = "";
        });
      };
    };

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 821px)", build("wipe"));
    mm.add("(prefers-reduced-motion: no-preference) and (max-width: 820px)", build("stack"));

    return () => mm.revert();
  }, []);

  return (
    <section className={styles.section} aria-labelledby="pledge-timeline-heading">
      {/* The visible heading and the /artists link were removed: the panels
          introduce themselves. The heading stays as a screen reader one so the
          section keeps an accessible name and the four promises are still
          announced under something, rather than arriving unheaded. */}
      <h2 id="pledge-timeline-heading" className="sr-only">
        {PLEDGE_HEADING}
      </h2>

      <div
        ref={wrapRef}
        className={styles.wrap}
        style={
          { "--panel-count": PLEDGES.length } as React.CSSProperties
        }
      >
        {/* On phones this frame is a horizontal scroll rail (see the CSS), and
            a scrollable region has to be operable by keyboard as well as by
            touch, so it is focusable and named. On desktop it is not
            scrollable and this is simply a labelled region. */}
        <div
          className={styles.frame}
          tabIndex={0}
          role="group"
          aria-label="The RAAYDR pledges"
        >
          {PLEDGES.map((pledge, i) => (
            <article
              key={pledge.title}
              className={styles.panel}
              style={{ "--accent": pledge.accent } as React.CSSProperties}
            >
              <div className={styles.panelInner}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.label}>
                    <span className="mono-figure" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")} /{" "}
                    </span>
                    {pledge.title}
                  </h3>
                  <p className={styles.body}>{pledge.body}</p>
                </div>
                <p className={styles.word} aria-hidden="true">
                  {pledge.big}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

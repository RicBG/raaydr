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
 * The pinning is CSS `position: sticky`, not ScrollTrigger's pin. The homepage
 * already pins the How It Works wheel, and pin spacers are inserted and removed
 * on refresh; sticky keeps this section out of that entirely and leaves
 * ScrollTrigger doing nothing but reporting progress. Progress arrives through
 * Lenis, which calls ScrollTrigger.update() on every scroll frame, so this
 * stays in step with the rest of the page instead of running its own scroll
 * listener against a scroll position Lenis is still animating.
 *
 * The panels are plain stacked blocks until the effect upgrades them, rather
 * than being clipped by default and unclipped by script. That way the promises
 * are readable with no JS, before hydration, and under reduced motion, where
 * a scroll driven wipe has no business running at all.
 */
export default function PledgeTimeline() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const mm = gsap.matchMedia();

    // Narrow viewports get the stacked reading too: at phone width a full
    // height panel leaves no room for the poster word beside the copy, and the
    // wipe costs a 400vh scroll to say four short things.
    mm.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 821px)",
      () => {
        const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, wrap);
        const count = panels.length;
        if (count < 2) return;

        // `progress` runs 0 to count - 1, so its whole part is the panel
        // currently on screen and its fraction is that panel's wipe.
        const applyAt = (progress: number) => {
          const scaled = gsap.utils.clamp(0, count - 1, progress);
          const current = Math.min(count - 2, Math.floor(scaled));
          const t = scaled - current;

          panels.forEach((panel, i) => {
            const word = panel.querySelector<HTMLElement>(`.${styles.word}`);
            const header = panel.querySelector<HTMLElement>(
              `.${styles.panelHeader}`
            );

            if (i === current) {
              // Wiping out: keep the left (1 - t) of the panel.
              panel.style.clipPath = `inset(0 ${t * 100}% 0 0)`;
              if (word) word.style.transform = `rotate(${-90 * t}deg)`;
              // The word pivots up through the left column, straight across
              // the copy that also lives there. Fading the header out over the
              // first part of the wipe keeps the two from overlapping: you read
              // the promise while the panel rests, and see the graphic while it
              // turns. Reversible, so scrubbing back fades it in again.
              if (header)
                header.style.opacity = String(Math.max(0, 1 - t * 2.5));
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
            panel.style.zIndex = String(i);
          });
        };

        wrap.dataset.mode = "timeline";
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
          panels.forEach((panel) => {
            panel.style.clipPath = "";
            panel.style.zIndex = "";
            const word = panel.querySelector<HTMLElement>(`.${styles.word}`);
            if (word) word.style.transform = "";
            const header = panel.querySelector<HTMLElement>(
              `.${styles.panelHeader}`
            );
            if (header) header.style.opacity = "";
          });
        };
      }
    );

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

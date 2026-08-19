"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { PLEDGES, PLEDGE_ANCHOR, PLEDGE_HEADING } from "@/lib/pledges";
import styles from "./Pledges.module.css";

/**
 * The full pledge section, deep linked from the homepage pledge bar.
 *
 * A scroll driven timeline: a full viewport frame pins while the page scrolls
 * roughly one viewport per pledge, and each panel wipes in horizontally over
 * the last one, scrubbed 1:1 to scroll position. The title swings up from the
 * bottom left as its panel arrives and swings back as it leaves.
 *
 * SUPERSEDES THE RULED LIST from PR #41. That rendering was chosen so the
 * promises read as a document rather than as more feature tiles, which was
 * right for a list sitting under the numbered points. Giving them the whole
 * viewport, one at a time, makes the same argument harder to skim past: a
 * promise you have to scroll through is a promise you have read.
 *
 * ONE DOM TREE, TWO RENDERINGS. The panels are the same markup whether they
 * animate or not; CSS decides whether they stack or stage, and the media query
 * here and the one in the stylesheet must stay in step. Nothing is duplicated
 * for the animation, so a screen reader gets the heading once and each pledge
 * once, and `clip-path` only ever hides a panel visually.
 */

/** Frame stays put while this much page scrolls past. One viewport per pledge. */
const SCRUB_DISTANCE = `+=${PLEDGES.length * 100}%`;

/** Below this, and under reduced motion, the pledges are a static stack. */
const STAGE_QUERY =
  "(min-width: 900px) and (prefers-reduced-motion: no-preference)";

/**
 * How the wipe runs, as clip-path insets.
 *
 * The incoming panel grows from the right edge leftward while the outgoing one
 * retreats towards the left edge, both off the same progress, so the two edges
 * stay welded into one seam travelling right to left. Keeping them
 * complementary matters: erase the outgoing panel on its own schedule and you
 * open a gap wherever neither panel has arrived, which flashes the empty frame
 * through the middle of every transition.
 *
 * THE DIRECTION IS SET BY WHERE THE TITLES SIT, and it is worth writing down
 * because the first build had it backwards. Both titles live in the bottom
 * left corner. A seam travelling left to right covers the outgoing title on
 * the first frame of the transition, so the rotation back to stowed happens
 * underneath the incoming panel and nobody ever sees it. Travelling right to
 * left, the bottom left corner is the last thing the wipe reaches: the old
 * promise stands up and swings away as the new field closes over it, and the
 * new one is landing at rest exactly as the seam uncovers it. Swapping these
 * four values reverses it again without touching the timeline.
 */
const WIPE = {
  incomingFrom: "inset(0% 0% 0% 100%)",
  incomingTo: "inset(0% 0% 0% 0%)",
  outgoingFrom: "inset(0% 0% 0% 0%)",
  outgoingTo: "inset(0% 100% 0% 0%)",
} as const;

/** Title rest and stowed angles. Rotated about its own left bottom corner. */
const TITLE_STOWED = -90;
const TITLE_REST = 0;

/** Beats per step: the panel sits, then the next one wipes over it. */
const HOLD = 0.45;
const WIPE_BEAT = 0.55;

export default function Pledges() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const panels = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-panel]")
    );
    const titles = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-panel-title]")
    );
    if (panels.length < 2) return;

    const mm = gsap.matchMedia();

    mm.add(STAGE_QUERY, () => {
      // The first panel is already on stage; every other one waits with its
      // title stowed. Set here as well as in CSS so resizing into this
      // breakpoint starts from the same place a fresh load does.
      gsap.set(panels[0], { clipPath: WIPE.incomingTo });
      gsap.set(titles[0], { rotate: TITLE_REST });
      gsap.set(panels.slice(1), { clipPath: WIPE.incomingFrom });
      gsap.set(titles.slice(1), { rotate: TITLE_STOWED });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: SCRUB_DISTANCE,
          pin: true,
          // 1:1 with scroll, per the brief, so no smoothing number here. The
          // wipe edge is a hard line, and a lagging clip-path reads as the
          // seam sliding after your finger rather than under it.
          scrub: true,
        },
      });

      panels.slice(1).forEach((panel, i) => {
        const at = i * (HOLD + WIPE_BEAT) + HOLD;

        tl.fromTo(
          panel,
          { clipPath: WIPE.incomingFrom },
          { clipPath: WIPE.incomingTo, duration: WIPE_BEAT, ease: "none" },
          at
        )
          .fromTo(
            panels[i],
            { clipPath: WIPE.outgoingFrom },
            { clipPath: WIPE.outgoingTo, duration: WIPE_BEAT, ease: "none" },
            at
          )
          // The arriving title swings down into place across the same beat,
          // and the departing one swings back the way it came.
          .fromTo(
            titles[i + 1],
            { rotate: TITLE_STOWED },
            { rotate: TITLE_REST, duration: WIPE_BEAT, ease: "none" },
            at
          )
          .fromTo(
            titles[i],
            { rotate: TITLE_REST },
            { rotate: TITLE_STOWED, duration: WIPE_BEAT, ease: "none" },
            at
          );
      });

      // A closing beat, so the last pledge is readable for a moment rather
      // than the pin releasing on the frame the final wipe lands.
      tl.to({}, { duration: HOLD });
    });

    // Under reduced motion, and on anything narrower, nothing is registered at
    // all: the stylesheet's static stack is the whole rendering.
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={PLEDGE_ANCHOR}
      className={styles.section}
      aria-labelledby="pledges-heading"
    >
      <div ref={stageRef} className={styles.frame}>
        <h2 id="pledges-heading" className={styles.heading}>
          {PLEDGE_HEADING}
        </h2>

        {PLEDGES.map((pledge, i) => (
          <article key={pledge.title} data-panel className={styles.panel}>
            {/*
              Order is eyebrow, promise, then what it means, and it is the
              reading order that decides it rather than the layout. On the
              staged rendering all three are positioned absolutely, so the
              title sits bottom left whatever the source order; on the static
              stack the source order IS the layout, and a heading printed
              after the paragraph it heads is backwards both to read and to
              hear. Screen readers get the promise first either way.
            */}
            <div className={styles.panelInner}>
              {/* Hidden from assistive tech: it numbers the panel, it does not
                  name it, and "01 slash" read before every promise is noise. */}
              <p className={styles.eyebrow} aria-hidden="true">
                {`${String(i + 1).padStart(2, "0")}/`}
              </p>
              <h3 data-panel-title className={styles.title}>
                {pledge.title}
              </h3>
              <p className={styles.body}>{pledge.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

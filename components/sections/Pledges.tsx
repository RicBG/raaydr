"use client";

import { useRef } from "react";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import { PLEDGES, PLEDGE_ANCHOR, PLEDGE_HEADING } from "@/lib/pledges";
import styles from "./Pledges.module.css";

/**
 * The full pledge section, deep linked from the homepage pledge bar. Rendered
 * on /artists under the numbered points.
 *
 * Deliberately not a card grid: the points above it are cards, and these are
 * promises, so they read as a ruled list, closer to a document than to more
 * feature tiles. The tint picks up the page's --halo-color (set by
 * AudiencePage) and falls back to a neutral anywhere else.
 */
export default function Pledges() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useMaskedReveal(headingRef);
  useReveal(listRef);

  return (
    <section
      id={PLEDGE_ANCHOR}
      className={styles.section}
      aria-labelledby="pledges-heading"
    >
      <div className={`container ${styles.inner}`}>
        <h2
          ref={headingRef}
          id="pledges-heading"
          className={`display-statement ${styles.heading}`}
        >
          {PLEDGE_HEADING}
        </h2>
        <div ref={listRef} className={styles.list}>
          {PLEDGES.map((pledge) => (
            <div key={pledge.title} className={styles.pledge} data-reveal>
              <h3 className={styles.pledgeTitle}>{pledge.title}</h3>
              <p className={styles.pledgeBody}>{pledge.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

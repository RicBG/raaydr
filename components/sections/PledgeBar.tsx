"use client";

import Link from "next/link";
import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import {
  PLEDGES,
  PLEDGE_HEADING,
  PLEDGE_HREF,
  PLEDGE_LINK_TEXT,
} from "@/lib/pledges";
import styles from "./PledgeBar.module.css";

/**
 * The compact pledge bar, between How It Works and the ticker on the homepage.
 * Third person one liners only, deep linking through to the full section on
 * /artists. Both this and that section read the same PLEDGES, so the short and
 * long forms of a promise can never say different things.
 *
 * The heading takes the body-copy reveal rather than the masked line reveal:
 * at this size it is a label on a bar, not a display headline.
 */
export default function PledgeBar() {
  const innerRef = useRef<HTMLDivElement>(null);
  useReveal(innerRef);

  return (
    <section className={styles.section} aria-labelledby="pledge-bar-heading">
      <div ref={innerRef} className={`container ${styles.inner}`}>
        <h2 id="pledge-bar-heading" className={styles.heading} data-reveal>
          {PLEDGE_HEADING}
        </h2>
        <ul className={styles.list}>
          {PLEDGES.map((pledge) => (
            <li key={pledge.short} className={styles.item} data-reveal>
              {pledge.short}
            </li>
          ))}
        </ul>
        <Link
          href={PLEDGE_HREF}
          className={`link-sweep ${styles.link}`}
          data-reveal
        >
          {PLEDGE_LINK_TEXT} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

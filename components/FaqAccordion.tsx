"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/lib/faqData";
import DayOneStatus from "./DayOneStatus";
import styles from "./FaqAccordion.module.css";

type FaqAccordionProps = {
  items: FaqItem[];
  heading?: string;
};

/**
 * Site-wide FAQ accordion. One row open at a time, fully collapsed on load.
 * Height is animated with the grid-template-rows 0fr -> 1fr trick (no library,
 * no dependency on the site's GSAP/ScrollTrigger/Lenis systems — it is inert
 * with respect to them). Ships FAQPage JSON-LD built from the same items.
 *
 * WHERE A FAQ STATES THE DAY ONE OFFER it carries the live open/closed line
 * above the list. The offer is the one answer here that can stop being true
 * between a build and a reader, and the line fails closed, so a FAQ that
 * cannot reach the platform says Day One has closed rather than selling a
 * place that may be gone. Which FAQ that is comes off the items
 * (`statesDayOneOffer`) rather than a list of pages in here. Board rows 2962
 * and 2965; Ric's go on 2967.
 *
 * It sits ABOVE the accordion on purpose: the rows are collapsed on load, so a
 * live status inside one would be invisible to everybody who does not open it.
 */
export default function FaqAccordion({
  items,
  heading = "Frequently asked questions",
}: FaqAccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className={styles.section} aria-labelledby={`${baseId}-heading`}>
      {/* FAQPage structured data — the SEO payoff. Built from the same items. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={`container ${styles.inner}`}>
        <h2 id={`${baseId}-heading`} className={styles.heading}>
          {heading}
        </h2>

        {items.some((item) => item.statesDayOneOffer) && <DayOneStatus />}

        <ul className={styles.list}>
          {items.map((item, i) => {
            const open = openIndex === i;
            const triggerId = `${baseId}-trigger-${i}`;
            const panelId = `${baseId}-panel-${i}`;
            return (
              <li key={item.question} className={styles.row}>
                <h3 className={styles.rowHeading}>
                  <button
                    type="button"
                    id={triggerId}
                    className={styles.trigger}
                    aria-expanded={open}
                    aria-controls={panelId}
                    data-open={open}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    <span className={styles.question}>{item.question}</span>
                    <span className={styles.icon} data-open={open} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={styles.panel}
                  data-open={open}
                >
                  <div className={styles.panelInner}>
                    <p className={styles.answer}>{item.answer}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

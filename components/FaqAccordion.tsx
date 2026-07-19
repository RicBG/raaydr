"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/lib/faqData";
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

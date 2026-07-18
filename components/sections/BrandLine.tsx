"use client";

import { useRef } from "react";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import styles from "./BrandLine.module.css";

// The brand line, promoted out of the footer to sit as the closing beat
// immediately above the bottom waitlist CTA. Same words, given the weight of
// the site's other headline moments. The footer keeps its own instance.
export default function BrandLine() {
  const lineRef = useRef<HTMLParagraphElement>(null);
  useMaskedReveal(lineRef);

  return (
    <section className={styles.section}>
      <div className="container">
        <p ref={lineRef} className={`display-statement ${styles.line}`}>
          Built for the culture. Owned by the community.
        </p>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import styles from "./TintedSection.module.css";

/**
 * A lighter content add-on: plain heading + body sitting on a softly tinted
 * background in the page's audience colour. The tint reuses the same visual
 * the "How it works" wheel paints on scroll (HowItWorksWheel's stageBg) — a
 * soft, low-opacity radial wash in the audience colour over the canvas — but
 * static, with no animation and no WebGL. Used for the "coming soon" lines and
 * the lighter secondary sections, where the Hero Callout would be too heavy.
 */
type TintedSectionProps = {
  /** Optional heading. Omitted for single-line "coming soon" notes. */
  heading?: string;
  body: string;
  /** The page's audience colour (hex or CSS colour). */
  color: string;
};

export default function TintedSection({ heading, body, color }: TintedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useReveal(sectionRef);
  useMaskedReveal(headingRef);

  return (
    <section
      className={styles.section}
      style={{ "--tint": color } as React.CSSProperties}
    >
      <div className={`container ${styles.inner}`} ref={sectionRef}>
        {heading && (
          <h2 ref={headingRef} className={`display-statement ${styles.heading}`}>
            {heading}
          </h2>
        )}
        <p
          className={heading ? styles.body : styles.note}
          data-reveal
        >
          {body}
        </p>
      </div>
    </section>
  );
}

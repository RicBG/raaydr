"use client";

import { useRef } from "react";
import { useMaskedReveal } from "@/lib/useMaskedReveal";
import { useReveal } from "@/lib/useReveal";
import LazyMount from "@/components/LazyMount";
import dynamic from "next/dynamic";
const DotPulse = dynamic(() => import("@/components/DotPulse"), { ssr: false });
import styles from "./TintedSection.module.css";

/**
 * A lighter content add-on: plain heading + body sitting on a softly tinted
 * background in the page's audience colour. The tint reuses the same visual
 * the "How it works" wheel paints on scroll (HowItWorksWheel's stageBg) — a
 * soft, low-opacity radial wash in the audience colour over the canvas — but
 * static, with no animation and no WebGL. Used for the "coming soon" lines and
 * the lighter secondary sections, where the Hero Callout would be too heavy.
 */
/** A body paragraph. Pass the object form to set one in bold mid-copy, where
 *  `boldNote` (which always lands last) cannot reach. */
export type TintedParagraph = string | { text: string; bold?: boolean };

type TintedSectionProps = {
  /** Optional heading. Omitted for single-line "coming soon" notes. */
  heading?: string;
  /** One paragraph, or several to sit together on a single tint band rather
   *  than splitting into consecutive sections (which seams the washes). */
  body: TintedParagraph | TintedParagraph[];
  /** The page's audience colour (hex or CSS colour). */
  color: string;
  /** Render a dark pulsing dot-field background (RAAYDR+) with white text
   *  instead of the soft tint. `color` drives the pulse colour. */
  dotPulse?: boolean;
  /** An extra bold line rendered after the body (inside the box for RAAYDR+). */
  boldNote?: string;
  /** Pad the top so the copy clears a ticker marquee tucked over this section. */
  clearsMarquee?: boolean;
};

export default function TintedSection({
  heading,
  body,
  color,
  dotPulse,
  boldNote,
  clearsMarquee,
}: TintedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useReveal(sectionRef);
  useMaskedReveal(headingRef);

  return (
    <section
      className={`${styles.section} ${dotPulse ? styles.dark : ""} ${
        clearsMarquee ? styles.clearsMarquee : ""
      }`}
      style={{ "--tint": color } as React.CSSProperties}
    >
      {dotPulse && (
        <div className={styles.dotBg} aria-hidden="true">
          <LazyMount style={{ position: "absolute", inset: 0 }}>
            <DotPulse
              pattern="breathe"
              followPointer={false}
              backgroundColor="#05060A"
              dotColor="#FFFFFF"
              pulseColor="#FFFFFF"
              spacing={8}
              dotSize={1}
              speed={0.2}
              ringGap={400}
              pulseWidth={0.2}
              swell={3}
              push={20}
              jitter={0.15}
            />
          </LazyMount>
        </div>
      )}
      <div className={`container ${styles.inner}`} ref={sectionRef}>
        <div className={dotPulse ? styles.box : styles.content}>
          {heading && (
            <h2
              ref={headingRef}
              className={`display-statement ${styles.heading}`}
            >
              {heading}
            </h2>
          )}
          {(Array.isArray(body) ? body : [body])
            .map((para) => (typeof para === "string" ? { text: para } : para))
            .map((para) => (
              <p
                key={para.text}
                className={
                  para.bold
                    ? styles.boldNote
                    : heading
                      ? styles.body
                      : styles.note
                }
                data-reveal
              >
                {para.text}
              </p>
            ))}
          {boldNote && (
            <p className={styles.boldNote} data-reveal>
              {boldNote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

import { SOCIETIES } from "@/lib/societies";
import styles from "./SocietyLogoRow.module.css";

/**
 * A row of seven collecting-society logos directly under the hero, `work_items` 256.
 *
 * The caller decides whether to draw it (see `lib/societies.ts`): this component always
 * draws. Each logo carries the society's name as its alt text, and the optical heights are the
 * design's own, so a wide wordmark and a tall mark weigh the same.
 */
export default function SocietyLogoRow() {
  return (
    <section className={styles.row} aria-label="Collecting societies">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.slashes}>{"//"}</span> Your society, on every track
        </p>
        <ul className={styles.logos}>
          {SOCIETIES.map((society) => (
            <li key={society.name} className={styles.logo}>
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed trimmed PNGs, sized by height */}
              <img
                src={society.src}
                alt={society.name}
                style={{ maxHeight: society.rowHeight }}
                loading="lazy"
                decoding="async"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

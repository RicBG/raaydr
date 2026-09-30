import { SOCIETIES } from "@/lib/societies";
import styles from "./SocietyLogoRow.module.css";

/**
 * A row of seven collecting-society logos at the foot of the hero, `work_items` 256.
 *
 * `inHero` draws it as an overlay on the pinned hero (transparent, compact) instead of a band
 * of its own. The band version sat after the pinned wrapper and was covered by the Problem
 * card, which is pulled up over the wrapper's scroll range; see `Hero.tsx`.
 *
 * The caller decides whether to draw it (see `lib/societies.ts`): this component always
 * draws. Each logo carries the society's name as its alt text, and the optical heights are the
 * design's own, so a wide wordmark and a tall mark weigh the same.
 */
export default function SocietyLogoRow({ inHero = false }: { inHero?: boolean }) {
  return (
    <section
      className={inHero ? `${styles.row} ${styles.inHero}` : styles.row}
      aria-label="Collecting societies"
    >
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

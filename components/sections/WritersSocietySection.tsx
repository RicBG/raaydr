import { SOCIETIES } from "@/lib/societies";
import styles from "./WritersSocietySection.module.css";

/**
 * "Signed to a collecting society? Add it when you upload.", `work_items` 256.
 *
 * Left five of twelve columns: the wave mark, `// For writers`, the heading and the body. Right
 * six, from column seven: a rounded panel holding the seven logos in four columns and an
 * "and more" cell. On a phone it stacks.
 *
 * THE WORDING IS THE SECTION AND THE LOGOS ARE THE FLAG. With `showLogos` false the panel is
 * not drawn and the wording stands on its own, which Riz ruled is fine to ship whenever Ric
 * says (board row 2220). The mark is the app's own four bars, exactly as the design draws them.
 */
export default function WritersSocietySection({ showLogos }: { showLogos: boolean }) {
  return (
    <section className={styles.section} aria-labelledby="writers-society-heading">
      <div className={styles.grid}>
        <div className={showLogos ? styles.text : `${styles.text} ${styles.textAlone}`}>
          <div className={styles.eyebrowRow}>
            <svg
              className={styles.mark}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="writers-mark"
                  gradientUnits="userSpaceOnUse"
                  x1="12"
                  y1="20"
                  x2="12"
                  y2="4"
                >
                  <stop offset="0%" stopColor="#7C4DFF" />
                  <stop offset="100%" stopColor="#3FC8D6" />
                </linearGradient>
              </defs>
              <g fill="url(#writers-mark)">
                <rect x="3" y="8" width="2" height="8" rx="1" />
                <rect x="8" y="4" width="2" height="16" rx="1" />
                <rect x="13" y="6" width="2" height="12" rx="1" />
                <rect x="18" y="9" width="2" height="6" rx="1" />
              </g>
            </svg>
            <p className={styles.eyebrow}>
              <span className={styles.slashes}>{"//"}</span> For writers
            </p>
          </div>
          <h2 id="writers-society-heading" className={styles.heading}>
            Signed to a collecting society? Add it when you upload.
          </h2>
          <p className={styles.body}>
            Tell us who collects for you and it sits on the track with your credits, wherever
            you are in the world.
          </p>
        </div>

        {showLogos ? (
          <ul className={styles.panel} aria-label="Collecting societies">
            {SOCIETIES.map((society) => (
              <li key={society.name} className={styles.cell}>
                {/* eslint-disable-next-line @next/next/no-img-element -- fixed trimmed PNGs, sized by height */}
                <img
                  src={society.src}
                  alt={society.name}
                  style={{ maxHeight: society.panelHeight }}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            ))}
            <li className={`${styles.cell} ${styles.more}`}>and more</li>
          </ul>
        ) : null}
      </div>
    </section>
  );
}

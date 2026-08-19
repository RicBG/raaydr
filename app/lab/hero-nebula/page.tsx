import type { Metadata } from "next";
import Nebula from "./Nebula";
import styles from "./lab.module.css";

/**
 * Design lab: the drifting-nebula hero direction, in two readings.
 *
 * The reference is a moment from a video Ric sent — centred white text over a
 * dark background of slowly drifting red/blue colour clouds. The brief is not
 * to copy it but to take its negative: the same weather system living on
 * RAAYDR's light canvas, in the brand spectrum, with ink type.
 *
 * Everything here is CSS. No WebGL context, no shader compile, no render
 * loop of ours — the clouds are pre-softened radial gradients moved by
 * compositor-only transform animations. This page exists to judge the look;
 * it is deliberately unlinked and unindexed.
 */
export const metadata: Metadata = {
  title: "Lab — Nebula hero",
  robots: { index: false, follow: false },
};

export default function HeroNebulaLab() {
  return (
    <main>
      <section className={`${styles.stage} ${styles.dark}`}>
        <Nebula variant="reference" />
        <div className={styles.copy}>
          <p className={styles.tag}>A / the reference read — dark</p>
          <h1 className={styles.heading}>
            Music streaming is broken. We fixed it. Now everyone wins.
          </h1>
          <p className={styles.sub}>Attention over streams.</p>
        </div>
      </section>

      <section className={`${styles.stage} ${styles.light}`}>
        <Nebula variant="negative" />
        <div className={styles.copy}>
          <p className={styles.tag}>B / the RAAYDR negative — light</p>
          <h1 className={styles.heading}>
            Music streaming is broken. We fixed it. Now everyone wins.
          </h1>
          <p className={styles.sub}>Attention over streams.</p>
        </div>
      </section>

      <section className={`${styles.stage} ${styles.light}`}>
        <Nebula variant="clouds" />
        <div className={styles.copy}>
          <p className={styles.tag}>C / the softer cloud take — light</p>
          <h1 className={styles.heading}>
            Music streaming is broken. We fixed it. Now everyone wins.
          </h1>
          <p className={styles.sub}>Attention over streams.</p>
        </div>
      </section>
    </main>
  );
}

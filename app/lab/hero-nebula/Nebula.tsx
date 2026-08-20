import styles from "./lab.module.css";

/**
 * Rim-lit liquid forms, after the reference frames: the body of each shape is
 * the same colour as the field, so the form itself is invisible — what you
 * see is a tapering rim of colour along its silhouette, like dark liquid lit
 * from behind.
 *
 * Construction per form: a colour sheet at the back (a blob filled with a
 * gradient), and an occluder in front — the same blob in the field colour,
 * nudged toward the light and with slightly different radii, so the sliver of
 * sheet left showing tapers along the curve exactly the way the reference
 * rims do. The pair animates as one group, transform-only, so after first
 * paint the compositor slides textures and nothing repaints.
 *
 * "clouds" is the earlier, softer reading kept for comparison: four
 * pre-blurred gradient blobs with no rims at all.
 */
export default function Nebula({
  variant,
}: {
  variant: "reference" | "negative" | "clouds";
}) {
  if (variant === "clouds") {
    return (
      <div className={`${styles.nebula} ${styles.nebulaClouds}`} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobA}`} />
        <div className={`${styles.blob} ${styles.blobB}`} />
        <div className={`${styles.blob} ${styles.blobC}`} />
        <div className={`${styles.blob} ${styles.blobD}`} />
      </div>
    );
  }

  const cls =
    variant === "reference" ? styles.rimsReference : styles.rimsNegative;
  return (
    <div className={`${styles.nebula} ${cls}`} aria-hidden="true">
      {/* Top-left form: enters from the corner, lit along its lower-right
          belly — the reference's red-to-purple arc. */}
      <div className={`${styles.form} ${styles.formA}`}>
        <div className={`${styles.sheet} ${styles.sheetA}`} />
        <div className={`${styles.occluder} ${styles.occluderA}`} />
      </div>
      {/* Bottom-right form: the blue shoulder rising into frame. */}
      <div className={`${styles.form} ${styles.formB}`}>
        <div className={`${styles.sheet} ${styles.sheetB}`} />
        <div className={`${styles.occluder} ${styles.occluderB}`} />
      </div>
      {/* Upper-right accent: the faint warm crest mostly out of frame. */}
      <div className={`${styles.form} ${styles.formC}`}>
        <div className={`${styles.sheet} ${styles.sheetC}`} />
        <div className={`${styles.occluder} ${styles.occluderC}`} />
      </div>
    </div>
  );
}

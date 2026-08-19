import styles from "./lab.module.css";

/**
 * The weather system: four large, pre-softened colour clouds drifting on
 * slow, offset orbits. Each blob is a radial gradient whose falloff does the
 * softening — no filter: blur, which we have measured pushing paint time on
 * the critical path before — and each animates transform only, so after the
 * first paint the browser moves textures instead of repainting pixels.
 *
 * The reference variant lives on near-black in the reference's red/blue.
 * The negative variant is the same system inverted onto the canvas token in
 * the brand spectrum: amber, orchid, violet, and a whisper of green.
 */
export default function Nebula({
  variant,
}: {
  variant: "reference" | "negative";
}) {
  const cls =
    variant === "reference" ? styles.nebulaReference : styles.nebulaNegative;
  return (
    <div className={`${styles.nebula} ${cls}`} aria-hidden="true">
      <div className={`${styles.blob} ${styles.blobA}`} />
      <div className={`${styles.blob} ${styles.blobB}`} />
      <div className={`${styles.blob} ${styles.blobC}`} />
      <div className={`${styles.blob} ${styles.blobD}`} />
    </div>
  );
}

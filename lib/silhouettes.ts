/**
 * The silhouette pool: sixteen transparent PNGs (1536×2048), interchangeable
 * by design — colour carries the audience meaning, not the person. Shuffled
 * once per page load (client side) and dealt to the audience moments in
 * order; whatever isn't dealt goes unused that load, which is correct.
 */
export const SILHOUETTES = Array.from(
  { length: 16 },
  (_, i) => `/silhouettes/silhouette-${String(i + 1).padStart(2, "0")}.png`
);

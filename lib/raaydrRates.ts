/**
 * RAAYDR rates, single source of truth.
 *
 * Every calculator, pricing block and copy string that needs a number reads from here.
 * Do not hardcode a rate anywhere else in the codebase.
 *
 * Derivation lives in raaydr-economics-locked.md. All per-fan figures are net of VAT,
 * PRS/MCPS at 16%, Stripe card, Stripe Billing and Stripe Connect, and are floored to
 * whole pence per §3 of that doc — see floorToPence below.
 */

export const PRICING = {
  dayOne: 6.99,
  standard: 9.99,
  plus: 3.99,
  /** Day One tier closes after this many listeners. Price locked forever for those who make it. */
  dayOneCap: 1000,
  /** RAAYDR+ is included for Day Ones and for the founding creator cohorts. */
  plusIncludedForDayOnes: true,
} as const;

/** Share of distributable revenue. Distributable is net of VAT, publishing and payment costs. */
export const SPLIT = {
  artists: 55,
  tastemakers: 15,
  raaydr: 30,
} as const;

/**
 * Floor a money amount to whole pence.
 *
 * raaydr-economics-locked.md v1.2 §3: a displayed per-cycle figure is the
 * floored whole-penny amount, never the rounded one. RAAYDR rounds in the
 * creator's favour or not at all, so a rate that lands between two pence is
 * presented as the lower of the two — the doc names £3.57 per fan per month
 * explicitly as a figure nothing may present.
 *
 * The epsilon absorbs binary float error: 3.56 * 100 is 355.99999999999994,
 * which would otherwise floor a whole penny too far.
 */
export function floorToPence(amount: number): number {
  return Math.floor(amount * 100 + 1e-9) / 100;
}

type PerTierRate = Record<RatesTier, number>;

const flooredPerTier = (rate: PerTierRate): PerTierRate => ({
  standard: floorToPence(rate.standard),
  dayOne: floorToPence(rate.dayOne),
});

/**
 * What one subscriber is worth per month at 100% attention share.
 * Calculators default to the standard tier because it is the steady state.
 *
 * Floored at the source, not at the point of display: every calculator
 * multiplies this rate by a fan count, so a rate carrying a fraction of a
 * penny would be magnified a thousand times over before anyone saw it.
 */
export const PER_FAN: { artist: PerTierRate; tastemaker: PerTierRate } = {
  artist: flooredPerTier({ standard: 3.56, dayOne: 2.46 }),
  tastemaker: flooredPerTier({ standard: 0.97, dayOne: 0.67 }),
};

/**
 * Published tastemaker ring-fence. Both round the true 15% upward.
 * RAAYDR rounds in the creator's favour, never its own.
 */
export const TASTEMAKER_RINGFENCE = {
  standard: 0.99,
  dayOne: 0.69,
} as const;

/**
 * Spotify comparison. Per monthly listener, not per stream.
 * Monthly listener is the metric artists actually see in Spotify for Artists.
 * Do not use a per-stream figure in listener-facing comparisons.
 */
export const SPOTIFY = {
  perMonthlyListener: 0.012,
} as const;

/**
 * Attention share is an artist's slice of each fan's total listening.
 * Default is Committed. Superfan is the top of the range, not the expectation.
 */
export const ATTENTION_PRESETS = [
  { label: "Casual", value: 10 },
  { label: "Committed", value: 20 },
  { label: "Superfan", value: 40 },
] as const;

export const ATTENTION_DEFAULT = 20;

/** Founding creator cohorts. RAAYDR+ free forever. */
export const FOUNDING_COHORTS = {
  artists: 100,
  producersAndSongwriters: 100,
  tastemakers: 25,
} as const;

export const PAYOUT = {
  minimumThreshold: 50,
  currency: "GBP",
} as const;

export type RatesTier = "standard" | "dayOne";

/** Artist monthly earnings from a given fan count and attention share. */
export function artistEarnings(fans: number, attentionPct: number): number {
  return fans * PER_FAN.artist.standard * (attentionPct / 100);
}

/** Producer or songwriter earnings, derived from the artist figure. Additive across artists. */
export function producerEarnings(
  fans: number,
  attentionPct: number,
  catalogueSharePct: number,
  splitPct: number
): number {
  return artistEarnings(fans, attentionPct) * (catalogueSharePct / 100) * (splitPct / 100);
}

/** Tastemaker monthly earnings from the ring-fenced fund. */
export function tastemakerEarnings(followers: number, drivenSharePct: number): number {
  return followers * PER_FAN.tastemaker.standard * (drivenSharePct / 100);
}

/** Spotify monthly listeners required to earn the same amount. */
export function spotifyEquivalentListeners(monthlyEarnings: number): number {
  return Math.round(monthlyEarnings / SPOTIFY.perMonthlyListener);
}

/** What Spotify would pay for this many monthly listeners, in pounds. */
export function spotifyMonthlyEarnings(fans: number): number {
  return fans * SPOTIFY.perMonthlyListener;
}

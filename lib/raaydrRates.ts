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

/**
 * The Day One cohort is 1,000 listeners, and it holds two price bands: the
 * earliest pay least. Both bands are locked forever. `dayOne` is the first
 * band, `dayOneNext` the second — anyone past the 1,000th listener is standard.
 */
export const PRICING = {
  /** Band one: the first 250 listeners of the Day One cohort. */
  dayOne: 6.99,
  /** Band two: the next 750, still Day Ones, still locked forever. */
  dayOneNext: 7.99,
  standard: 9.99,
  plus: 3.99,
  /** The Day One cohort closes after this many listeners, across both bands. */
  dayOneCap: 1000,
  /** How many of that 1,000 get the first band. The rest get the second. */
  dayOneFirstBand: 250,
  /** RAAYDR+ is included for Day Ones and for the founding creator cohorts. */
  plusIncludedForDayOnes: true,
} as const;

/** Listeners in the second Day One band: whatever the cohort has left. */
export const DAY_ONE_NEXT_BAND = PRICING.dayOneCap - PRICING.dayOneFirstBand;

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
  dayOneNext: floorToPence(rate.dayOneNext),
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
  artist: flooredPerTier({ standard: 3.56, dayOne: 2.46, dayOneNext: 2.82 }),
  tastemaker: flooredPerTier({ standard: 0.97, dayOne: 0.67, dayOneNext: 0.76 }),
};

/*
 * TASTEMAKER_RINGFENCE (standard 0.99, dayOne 0.69) was removed here.
 *
 * It was a pound-per-listener ring-fence from the superseded £5.99/£7.99 price
 * ladder, where copy read "£0.99 of every subscription is ringfenced for the
 * people who find music first". That ladder, and that copy, were replaced by
 * the £6.99/£7.99/£9.99 bands and the percentage-with-denominator rule. The
 * constant survived the rewrite unimported and 2p above the live
 * PER_FAN.tastemaker figures, so it could only ever have reintroduced a rate
 * belonging to prices nobody pays. The live tastemaker rate is
 * PER_FAN.tastemaker. Do not restore this without a current published source.
 */

/**
 * Spotify comparison anchors.
 *
 * Only `perStream` is observed: it comes from a real independent artist's
 * distributor dashboard ($24.6K over 6.92 million lifetime streams, roughly
 * £0.0028 to £0.003 per stream), published in the per-stream Pulse post.
 * Everything else here is an assumption about listener behaviour and is
 * labelled as such.
 */
export const SPOTIFY = {
  /**
   * MODELLED, AND DISPUTED IN OUR OWN COPY. Per monthly listener, not per
   * stream. Monthly listener is the metric artists actually see in Spotify for
   * Artists, so it is the right unit for a listener-facing comparison.
   *
   * £0.012 implies 4 streams per monthly listener per month at `perStream`.
   * content/pulse/how-many-streams-for-1000-a-month.md asserts 5 to 10 plays
   * per monthly listener per month, which would put this at £0.015 to £0.030
   * and cut the "monthly listeners needed to match" figures by 20% to 60%.
   * Neither number is sourced. Both are still live. This is recorded, not
   * resolved: changing either moves published headline figures, so it needs a
   * ruling rather than a quiet edit.
   */
  perMonthlyListener: 0.012,
  /** OBSERVED. Blended effective rate from the distributor dashboard above. */
  perStream: 0.003,
  /**
   * MODELLED. What "one engaged fan" means in the per-fan comparison: someone
   * playing your music around 80 times a month. Sets the £0.24 anchor the
   * canonical claim is measured against.
   */
  engagedFanStreamsPerMonth: 80,
  /**
   * Spotify Premium Individual, UK. £12.99 since November 2025, up from
   * £11.99 (announced 25 October 2025). Checked July 2026. Listener-facing
   * copy must read this rather than spelling a price out.
   */
  subscriptionPrice: 12.99,
} as const;

/**
 * What one engaged fan is worth per month on Spotify: the observed per-stream
 * rate times the modelled 80 streams. Floored on the same rule as PER_FAN so
 * both sides of the canonical comparison are rounded the same way.
 */
export const SPOTIFY_ENGAGED_FAN_MONTHLY = floorToPence(
  SPOTIFY.perStream * SPOTIFY.engagedFanStreamsPerMonth
);

/**
 * THE CANONICAL COMPARISON. One claim, one place, every surface reads it.
 *
 * This is the only sanctioned RAAYDR-versus-streaming multiple. It holds one
 * variable constant: the same person, with the same listening behaviour, on
 * both platforms. Every other framing that has been in circulation changed
 * either the unit (fan versus bare monthly listener) or the behaviour (80
 * streams versus 4) partway through the comparison, which is how four
 * different multiples came to exist for one model.
 *
 * `multiple` is derived, never typed. If a rate moves, the claim moves with
 * it. The exact ratio is currently 14.83, presented as "around 15x".
 *
 * The denominator is not optional decoration. Quote it wherever the per-fan
 * pound figure appears: the figure is a ceiling on one fan at full attention,
 * not an expected monthly income.
 */
const CANONICAL_MULTIPLE = Math.round(
  PER_FAN.artist.standard / SPOTIFY_ENGAGED_FAN_MONTHLY
);

export const CANONICAL = {
  /** Ceiling for one fan at 100% attention, standard tier. */
  artistPerFan: PER_FAN.artist.standard,
  /** The same fan on Spotify, at 80 streams a month. */
  spotifyPerFan: SPOTIFY_ENGAGED_FAN_MONTHLY,
  multiple: CANONICAL_MULTIPLE,
  claim: `On RAAYDR, one engaged fan is worth up to £${PER_FAN.artist.standard.toFixed(2)} a month to an artist, around ${CANONICAL_MULTIPLE}x what the same fan is worth on Spotify.`,
  denominator: `${SPLIT.artists}% of a £${PRICING.standard} subscription after VAT, publishing royalties and card fees. Actual earnings depend on your share of each fan's listening.`,
} as const;

/**
 * Every calculator multiplies by a share nobody has measured yet. RAAYDR is
 * pre-launch, so there is no observed distribution of attention or of driven
 * listening: the presets are assumptions the user is choosing between, not
 * rates we have seen. Any surface that turns one of those shares into a pound
 * figure has to say so.
 */
export const MODELLED_SHARE_NOTE = {
  attention:
    "Attention share is an assumption, not an observed rate. RAAYDR is pre-launch, so there is no measured average yet.",
  driven:
    "Driven share is an assumption, not an observed rate. RAAYDR is pre-launch, so there is no measured average yet.",
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

export type RatesTier = "standard" | "dayOne" | "dayOneNext";

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

/**
 * The Spotify side of the canonical, matched-fan comparison: the same engaged
 * fans, at the same attention share, on Spotify instead.
 *
 * This is deliberately not spotifyMonthlyEarnings. That function prices a bare
 * monthly listener and ignores attention entirely, so the two are not
 * interchangeable and must never be swapped for each other to make a number
 * look better. Use this one wherever the copy says "the same fan".
 */
export function spotifyEngagedFanEarnings(
  fans: number,
  attentionPct: number
): number {
  return fans * (attentionPct / 100) * SPOTIFY_ENGAGED_FAN_MONTHLY;
}

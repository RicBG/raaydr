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
 * Attention share is an artist's slice of each fan's total listening.
 * Default is Committed. Superfan is the top of the range, not the expectation.
 *
 * Declared above the Spotify anchors because the canonical comparison is
 * stated at the default share, so CANONICAL reads from it.
 */
export const ATTENTION_PRESETS = [
  { label: "Casual", value: 10 },
  { label: "Committed", value: 20 },
  { label: "Superfan", value: 40 },
] as const;

export const ATTENTION_DEFAULT = 20;

/**
 * Spotify comparison anchors.
 *
 * `perStream` is the only observed number on this side of any comparison: it
 * comes from a real independent artist's distributor dashboard ($24.6K over
 * 6.92 million lifetime streams, roughly £0.0028 to £0.003 per stream),
 * published in the per-stream Pulse post. Everything else here is an
 * assumption about listener behaviour and is labelled as such.
 *
 * There is deliberately no per-monthly-listener rate. One existed (£0.012,
 * implying 4 plays a month) and drove the "monthly listeners needed to match"
 * figures, but it was unsourced and contradicted by our own copy, which puts
 * an average listener at 5 to 10 plays. Rather than pick between two numbers
 * we cannot stand behind, comparisons are now expressed in streams, which
 * needs only `perStream`. Do not reintroduce a per-listener rate: it smuggles
 * a listening-behaviour assumption into a figure that reads as a headcount.
 */
export const SPOTIFY = {
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
 * What one engaged fan is worth per month on a platform paying `perStream`.
 * Floored on the same rule as PER_FAN so every side of every comparison is
 * rounded the same way.
 */
export function engagedFanMonthly(perStream: number): number {
  return floorToPence(perStream * SPOTIFY.engagedFanStreamsPerMonth);
}

/** What one engaged fan is worth per month on Spotify. */
export const SPOTIFY_ENGAGED_FAN_MONTHLY = engagedFanMonthly(SPOTIFY.perStream);

/**
 * UNSOURCED. Commonly cited per-stream estimates for other platforms, used in
 * the per-stream comparison table. No platform publishes an official rate and
 * these have no distributor data behind them, unlike SPOTIFY.perStream.
 *
 * They live here rather than in the post so the table's "one engaged fan is
 * worth" column is computed from them. It previously carried £0.62 for Apple
 * where the stated £0.008 gives £0.64: a hand-typed figure that drifted from
 * the rate printed beside it, in a table that reads as derived.
 */
export const PLATFORM_PER_STREAM_ESTIMATES = {
  youtubeMusic: 0.0015,
  appleMusic: 0.008,
} as const;

/**
 * Distributable revenue per subscription: what the 55/15/30 split is a share
 * of, after VAT, publishing royalties and payment costs.
 *
 * PUBLISHED FIGURE, NOT DERIVED FROM THE CONSTANTS ABOVE. It comes from the
 * fitted deduction stack, not from PER_FAN. Deriving it the other way, as
 * PER_FAN.artist.standard / 55%, gives £6.4727, which is the floor of a range
 * rather than the value: because the artist rate is floored to whole pence,
 * any distributable in [£6.4727, £6.4909) produces the published £3.56, and
 * £6.49 sits inside that range. Both figures are correct and they are not the
 * same number. Do not "fix" one to match the other.
 *
 * calculator.test.ts pins the containment, so if a rate moves and £6.49 falls
 * out of the implied range, the build says so.
 */
export const DISTRIBUTABLE = {
  standard: 6.49,
} as const;

/** Pence, for sub-pound per-fan figures. 0.71 to "71p", 0.048 to "4.8p". */
function pence(amount: number): string {
  const rounded = Math.round(amount * 1000) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}p`;
}

const CANONICAL_MULTIPLE = Math.round(
  PER_FAN.artist.standard / SPOTIFY_ENGAGED_FAN_MONTHLY
);

// The per-fan figures at the default attention share: what a fan is actually
// worth, as opposed to the ceiling. Floored on the artist side per §3; the
// Spotify side is sub-penny so it is presented to one decimal place.
//
// "a fifth" in the claim below is ATTENTION_DEFAULT in words. If that default
// ever moves off 20, the wording has to move with it.
const TYPICAL_ARTIST = floorToPence(
  (PER_FAN.artist.standard * ATTENTION_DEFAULT) / 100
);
const TYPICAL_SPOTIFY =
  (SPOTIFY_ENGAGED_FAN_MONTHLY * ATTENTION_DEFAULT) / 100;

/**
 * THE CANONICAL COMPARISON. One claim, one place, every surface reads it.
 *
 * This is the only sanctioned RAAYDR-versus-streaming comparison. It holds one
 * variable constant: the same person, with the same listening behaviour, on
 * both platforms. Every framing that has been in circulation changed either
 * the unit (fan versus bare monthly listener) or the behaviour (80 streams
 * versus 4) partway through, which is how four different multiples came to
 * exist for one model.
 *
 * The claim leads with what a fan is really worth at the default attention
 * share, not with the ceiling. £3.56 is reached only by a fan who plays
 * literally nothing else, so leading with it states a bound nobody hits. This
 * costs nothing: the ratio between the two platforms is attention-invariant
 * at 14.83, so an honest level keeps the whole multiple.
 *
 * `multiple` is derived, never typed. If a rate moves, the claim moves with it.
 *
 * The denominator is not optional decoration. Quote it wherever a per-fan
 * figure appears.
 */
export const CANONICAL = {
  /** Ceiling: one fan at 100% attention, standard tier. */
  artistPerFan: PER_FAN.artist.standard,
  /** The same fan on Spotify, at 80 streams a month. Also a ceiling. */
  spotifyPerFan: SPOTIFY_ENGAGED_FAN_MONTHLY,
  multiple: CANONICAL_MULTIPLE,
  typicalAttentionPct: ATTENTION_DEFAULT,
  /**
   * The realistic per-fan figure and its comparison, as ONE string.
   *
   * Deliberately not two exported numbers. 71p on its own undersells badly and
   * invites being quoted alone; it only means anything beside the 4.8p the
   * same fan is worth on Spotify. Keeping them welded together is the only
   * enforcement the type system can give us, so do not add a constant that
   * returns the artist side by itself.
   */
  typicalPair: `${pence(TYPICAL_ARTIST)} a month, against ${pence(TYPICAL_SPOTIFY)} on Spotify`,
  claim: `A fan who gives you a fifth of their listening is worth ${pence(TYPICAL_ARTIST)} a month, against ${pence(TYPICAL_SPOTIFY)} on Spotify. One who plays nothing but you is worth £${PER_FAN.artist.standard.toFixed(2)}.`,
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

/**
 * Spotify streams required to earn the same amount.
 *
 * Replaces spotifyEquivalentListeners(), which divided by a per-monthly-
 * listener rate and so answered "how many people" using an unsourced
 * assumption about how much each of them listens. Streams need only the
 * observed per-stream rate and make no claim about headcount at all.
 */
export function spotifyEquivalentStreams(monthlyEarnings: number): number {
  return Math.round(monthlyEarnings / SPOTIFY.perStream);
}

/**
 * The Spotify side of the canonical, matched-fan comparison: the same engaged
 * fans, at the same attention share, on Spotify instead.
 *
 * Both sides of any comparison must take the same attention share. Pricing the
 * Spotify side off a flat per-listener rate ignores attention entirely and
 * changes the population halfway through, which is what produced four
 * different multiples for one model. Use this wherever the copy says "the
 * same fan".
 */
export function spotifyEngagedFanEarnings(
  fans: number,
  attentionPct: number
): number {
  return fans * (attentionPct / 100) * SPOTIFY_ENGAGED_FAN_MONTHLY;
}

/**
 * RAAYDR rates, single source of truth.
 *
 * Every calculator, pricing block and copy string that needs a number reads from here.
 * Do not hardcode a rate anywhere else in the codebase.
 *
 * Derivation lives in raaydr-economics-locked.md. All per-fan figures are net of VAT,
 * PRS/MCPS at 16%, Stripe card, Stripe Billing and Stripe Connect, and are floored to
 * whole pence per §3 of that doc — see floorToPence below.
 *
 * PRS/MCPS 16% is a deliberate CEILING, ruled 3 August 2026: the highest rate
 * RAAYDR expects to pay, so every figure below is a floor. If the true licensed
 * rate turns out lower, every creator earns more than we advertised, never
 * less. It remains the largest single input in the stack — a one-point move
 * changes the artist per-fan figure by roughly 4p — and is to be re-checked
 * against a published rate card and a music lawyer before launch pricing is
 * finalised. The rate itself lives in the platform repo's rates file, which is
 * the executable source; this note records the ruling so the direction of the
 * margin is not lost on the side that publishes the numbers.
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
  artist: flooredPerTier({ standard: 3.56, dayOne: 2.46, dayOneNext: 2.83 }),
  tastemaker: flooredPerTier({ standard: 0.97, dayOne: 0.67, dayOneNext: 0.77 }),
};

/*
 * dayOneNext corrected from £2.82 / £0.76 to £2.83 / £0.77 on 3 August 2026,
 * closing the open discrepancy in raaydr-economics-locked.md §3a.
 *
 * Settled by running the platform repo's own distributableExact() — the
 * executable source of truth — rather than by argument. That function
 * reproduces every figure this file publishes for the other two bands
 * (648.322p and 447.922p unrounded, giving 3.56/0.97 and 2.46/0.67 exactly),
 * so putting £7.99 through the identical maths is the same computation, not a
 * reconstruction of it. At the floor-in-pence Connect rule's 7p it gives
 * 514.722p, and 55% / 15% of that floor to 283p and 77p.
 *
 * §3a attributed the old £2.82 to an implementation that invented 8p for
 * Connect. That explains the artist figure and only the artist figure: 8p
 * gives 513.722p, whose 15% still floors to 77p. No whole-penny Connect value
 * reaches £0.76 — it needs distributable in [512.73p, 513.33p), and nothing in
 * the stated inputs lands there. The two wrong figures had two different
 * causes, and one of them had no derivation at all.
 */

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
 * published in the per-stream Pulse post.
 *
 * There is deliberately no per-fan rate here, and no per-monthly-listener
 * rate. Both require a figure for how much a person listens in a month, and no
 * such figure has ever been sourced. Two were tried and both are retired:
 * £0.012 per monthly listener (implying 4 plays), and an 80-streams-a-month
 * "engaged fan" that set a £0.24 ceiling and made the canonical claim read
 * 15x. The 80 was modelled, was never stated in any version of
 * raaydr-economics-locked.md, and the multiple was linear in it: at a more
 * ordinary 800 to 1,000 streams a month the same arithmetic gives roughly 1.5x
 * to 1.2x. A headline that swings by an order of magnitude on an unsourced
 * input is not a headline, so the per-fan comparison was retired on 3 August
 * 2026 in favour of the streams form below.
 *
 * Do not reintroduce a Spotify figure denominated per fan, per listener or per
 * month. Each one smuggles a listening-volume assumption into a figure that
 * does not read like it carries one.
 */
export const SPOTIFY = {
  /** OBSERVED. Blended effective rate from the distributor dashboard above. */
  perStream: 0.003,
  /**
   * Spotify Premium Individual, UK. £12.99 since November 2025, up from
   * £11.99 (announced 25 October 2025).
   *
   * Verified against Spotify's own pricing page by Ric on 1 August 2026. Worth
   * recording, because it was first taken from search-result summaries: every
   * direct fetch of spotify.com and of the trade coverage returns 403 to an
   * automated request, so this figure cannot be re-checked from here. When it
   * next moves, a human has to look.
   *
   * Listener-facing copy must read this rather than spelling a price out.
   */
  subscriptionPrice: 12.99,
} as const;

/**
 * OBSERVED, first-party. What one Spotify monthly listener actually plays.
 *
 * Back-solved from Ric's own Spotify for Artists data, recorded in §5 of the
 * economics doc: roughly 1,089 monthly listeners generating about £13 a month.
 * At the observed £0.003 a stream that is about 4,333 streams, so:
 *
 *     4,333 streams / 1,089 listeners = 4 plays per listener per month
 *
 * This is the anchor the Spotify side of the calculator is built on, and it is
 * real measured data rather than an industry estimate. Everything below is
 * stated as a multiple of it, so the size of each assumption is visible.
 */
export const SPOTIFY_PLAYS_PER_MONTHLY_LISTENER = 4;

/**
 * How many times a fan plays YOUR music in a month. The Spotify side's only
 * input, and the visitor sets it.
 *
 * THIS REPLACES A MODEL THAT WAS WRONG BY 25x, on 3 August 2026.
 *
 * The broken version multiplied a fan's TOTAL monthly listening by the artist's
 * attention share: 500 plays x 20% = 100 plays of your music, per fan, every
 * month. Against the anchor above that is twenty-five times what a real
 * listener does, and at 1,000 fans it claimed Spotify would pay £300 a month
 * for what is actually 100,000 streams. The arithmetic was right; the input was
 * absurd, and chaining two assumptions is what hid it — neither 500 total plays
 * nor a 20% share looks unreasonable until you multiply them.
 *
 * So the chain is gone. Plays of your music is now asked for directly, in one
 * number that can be checked against real Spotify for Artists data, and the
 * attention share no longer touches this side at all. It cannot: the input
 * already IS your share of their listening, expressed in plays.
 *
 * That separation is also the honest description of the two models. Spotify
 * pays for absolute plays and does not care what share of a person you hold.
 * RAAYDR pays for the share and does not care about the play count. Two
 * currencies, so the calculator asks for both.
 *
 * NEVER let these reach CANONICAL, a Pulse token, or any static copy: §5 still
 * forbids a *published* per-fan Spotify figure, and these are calculator inputs.
 */
/*
 * Labelled by FREQUENCY, not by fan type. The attention presets next to these
 * are already Casual / Committed / Superfan, and reusing those words here put
 * two identical-looking button rows on the same panel — indistinguishable to
 * anyone reading, and ambiguous to a screen reader and to any test driving the
 * page by accessible name. Frequency also says more: "roughly weekly" is a
 * thing a person can picture, "Casual" is not.
 */
export const SPOTIFY_PLAYS_PRESETS = [
  /** A typical monthly listener. Exactly the observed anchor, about weekly. */
  { label: "Weekly", value: SPOTIFY_PLAYS_PER_MONTHLY_LISTENER },
  /** Four times the average listener — roughly every other day. */
  { label: "Often", value: 16 },
  /** Ten times the average listener, better than once a day. */
  { label: "Daily", value: 40 },
] as const;

/**
 * Default: 16 plays a month, four times the observed average monthly listener.
 *
 * Chosen to match the Committed attention preset, since the calculator's
 * population is "people who genuinely rate you" rather than everyone who
 * happened to hear you once. The 4x step is modelled and the visitor can move
 * it; the 4 it multiplies is not.
 */
export const SPOTIFY_PLAYS_DEFAULT = 16;

export const SPOTIFY_PLAYS_MIN = 1;
export const SPOTIFY_PLAYS_MAX = 100;

/**
 * How many streams on a platform paying `perStream` it takes to earn a given
 * amount. The only honest bridge between the two models: RAAYDR pays per fan
 * and does not care about volume, Spotify pays per play and cares about
 * nothing else, so the one thing that can be stated without inventing a
 * listening habit is how much play it takes to raise the same money.
 *
 * Replaces engagedFanMonthly(), which multiplied a per-stream rate by an
 * assumed 80 plays a month to produce a per-fan figure. See the note on
 * SPOTIFY for why that direction is not available to us.
 */
export function equivalentStreams(
  monthlyEarnings: number,
  perStream: number
): number {
  return Math.round(monthlyEarnings / perStream);
}

/**
 * UNSOURCED. Commonly cited per-stream estimates for other platforms, used in
 * the per-stream comparison table. No platform publishes an official rate and
 * these have no distributor data behind them, unlike SPOTIFY.perStream.
 *
 * They live here rather than in the post so the table's "streams needed" column
 * is computed from them. It previously carried £0.62 for Apple where the stated
 * £0.008 gives £0.64: a hand-typed figure that drifted from the rate printed
 * beside it, in a table that reads as derived.
 */
export const PLATFORM_PER_STREAM_ESTIMATES = {
  youtubeMusic: 0.0015,
  appleMusic: 0.008,
} as const;

/**
 * Distributable revenue per subscription: what the 55/15/30 split is a share
 * of, after VAT, publishing royalties and payment costs.
 *
 * NOT DERIVED FROM THE CONSTANTS ABOVE. It comes from the waterfall, not from
 * PER_FAN. Deriving it backwards, as PER_FAN.artist.standard / 55%, gives
 * £6.4727, which is the floor of a range rather than the value: because the
 * artist rate is floored to whole pence, any distributable in
 * [£6.4727, £6.4909) produces the published £3.56. Both figures are right and
 * they are not the same number. Do not "fix" one to match the other.
 *
 * £6.48, corrected from £6.49 on 1 August 2026. Reproduced from
 * packages/rates/src/raaydr-rates.ts in the platform repo, which is the
 * executable source of truth: distributableMinor('standard') returns 648
 * (648.3220p before flooring), and that repo's own test pins it. The economics
 * doc agrees at v1.3 §3 and lists the old £6.49 as superseded in §8. £6.49 was
 * a presentation rounding that predated the rates file.
 *
 * calculator.test.ts pins the containment, so if a rate moves and this figure
 * falls out of the implied range, the build says so.
 */
export const DISTRIBUTABLE = {
  standard: 6.48,
  dayOneNext: 5.14,
  dayOne: 4.47,
} as const;

/**
 * The same waterfall, unrounded. This is what the split is actually taken of.
 *
 * Reproduced by running distributableExact() from the platform repo, the
 * executable source of truth, on 3 August 2026. The £9.99 and £6.99 values are
 * that function's own output for the two tiers it defines; £7.99 is the
 * identical function applied to a 799p gross with the floor-in-pence Connect
 * allocation of 7p, because the platform repo has no £7.99 band to call.
 *
 * Its purpose is to make PER_FAN checkable rather than merely typed.
 * calculator.test.ts derives every artist and tastemaker rate from these, so a
 * hand-typed figure can no longer drift from the model that produced it — which
 * is exactly how £2.82 and £0.76 survived on the live site for four days while
 * three independent routes said £2.83 and £0.77.
 */
export const DISTRIBUTABLE_EXACT = {
  standard: 6.48322,
  dayOneNext: 5.14722,
  dayOne: 4.47922,
} as const;

/** Pence, for sub-pound per-fan figures. 0.71 to "71p". */
function pence(amount: number): string {
  const rounded = Math.round(amount * 1000) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}p`;
}

/** Stream counts, grouped. 1187 to "1,187". */
function streams(count: number): string {
  return count.toLocaleString("en-GB");
}

// What a fan is actually worth at the default attention share, as opposed to
// the ceiling. Floored per §3.
//
// "a fifth" in the claim below is ATTENTION_DEFAULT in words. If that default
// ever moves off 20, the wording has to move with it.
const TYPICAL_ARTIST = floorToPence(
  (PER_FAN.artist.standard * ATTENTION_DEFAULT) / 100
);

// The Spotify side of the claim, in the only unit that needs no assumption
// about how much anyone listens: the plays it takes to raise the same money.
const TYPICAL_STREAMS = equivalentStreams(TYPICAL_ARTIST, SPOTIFY.perStream);
const CEILING_STREAMS = equivalentStreams(
  PER_FAN.artist.standard,
  SPOTIFY.perStream
);

/**
 * THE CANONICAL COMPARISON. One claim, one place, every surface reads it.
 *
 * This is the only sanctioned RAAYDR-versus-streaming comparison, and it is
 * expressed in streams rather than as a multiple. Every earlier framing needed
 * a number for how much a person listens in a month — 4 plays, 80 plays, a
 * bare monthly listener — and no such number has ever been sourced. That is
 * how one model came to carry four different multiples (10x, 15x, 59x, 100x).
 * Stating the comparison as "the plays it takes to earn the same" removes the
 * assumption entirely: both figures below are arithmetic on the §3 waterfall
 * and the observed £0.003, and nothing else.
 *
 * There is deliberately no `multiple` here any more. A dimensionless multiple
 * cannot be formed without dividing by a per-fan Spotify figure, and that
 * figure cannot be built without assuming a listening volume. The old 15x was
 * that assumption wearing a derivation: `Math.round(3.56 / 0.24)`, where 0.24
 * was 80 unsourced streams. Do not reintroduce one.
 *
 * The claim leads with what a fan is really worth at the default attention
 * share, not with the ceiling. £3.56 is reached only by a fan who plays
 * literally nothing else, so leading with it states a bound nobody hits.
 *
 * The denominator is not optional decoration. Quote it wherever a per-fan
 * figure appears.
 */
export const CANONICAL = {
  /** Ceiling: one fan at 100% attention, standard tier. */
  artistPerFan: PER_FAN.artist.standard,
  /** What one fan at the default share is worth, in Spotify plays. */
  typicalStreams: TYPICAL_STREAMS,
  /** What one fan at 100% attention is worth, in Spotify plays. */
  ceilingStreams: CEILING_STREAMS,
  typicalAttentionPct: ATTENTION_DEFAULT,
  /**
   * The realistic per-fan figure and its comparison, as ONE string.
   *
   * Deliberately not two exported numbers. 71p on its own undersells badly and
   * invites being quoted alone; it only means anything beside the play count it
   * would take to raise the same money. Keeping them welded together is the
   * only enforcement the type system can give us, so do not add a constant that
   * returns the artist side by itself.
   */
  typicalPair: `${pence(TYPICAL_ARTIST)} a month, which on Spotify takes around ${streams(TYPICAL_STREAMS)} plays`,
  claim: `A fan who gives you a fifth of their listening is worth ${pence(TYPICAL_ARTIST)} a month. Earning that from Spotify instead takes around ${streams(TYPICAL_STREAMS)} plays. A fan who plays nothing but you is worth £${PER_FAN.artist.standard.toFixed(2)}, or around ${streams(CEILING_STREAMS)} plays.`,
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
  return equivalentStreams(monthlyEarnings, SPOTIFY.perStream);
}

/**
 * What the same fans are worth per month on Spotify, in pounds.
 *
 * `playsPerFanPerMonth` is plays of YOUR music, not of everything. It is a
 * required parameter so no caller can produce a pound figure while pretending
 * it assumed nothing — the two functions this replaced both did exactly that,
 * one by reading 80 from a constant and one by multiplying a total-listening
 * figure through an attention share.
 *
 * NOTE THE MISSING ARGUMENT. Attention share is deliberately not taken here,
 * and adding it back would double-count: the play count already is your slice
 * of that fan's listening. Spotify pays for plays and is indifferent to what
 * share of a person you hold; that indifference is the point of the comparison,
 * so the function signature reflects it.
 *
 * Do not use this to build any published claim. §5 of the economics doc still
 * forbids a per-fan Spotify figure in copy without a citable source, and
 * CANONICAL stays in plays for that reason.
 */
export function spotifyFanEarnings(
  fans: number,
  playsPerFanPerMonth: number
): number {
  return fans * playsPerFanPerMonth * SPOTIFY.perStream;
}

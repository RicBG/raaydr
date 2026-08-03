import {
  DAY_ONE_NEXT_BAND,
  PER_FAN,
  PRICING,
  type RatesTier,
} from "./raaydrRates";

/**
 * Calculator UI helpers. All money rates live in raaydr-rates.ts
 * (PER_FAN etc.); this module only holds the slider mapping and the
 * qualitative milestone, plus thin wrappers that read the rates.
 */

/** Pricing tier used across the calculators. Steady state is standard. */
export type PricingTier = RatesTier; // "standard" | "dayOne" | "dayOneNext"

/**
 * Tier selector options, shared so every calculator offers the same three in
 * the same order with the same labels. Cheapest first, because that is the
 * order listeners join in. Prices and band sizes come from PRICING; no
 * calculator spells a rate, a price or a cohort size out for itself.
 */
export const PRICING_TIERS: readonly PricingTier[] = [
  "dayOne",
  "dayOneNext",
  "standard",
];

/** Default tier for every calculator: standard is the steady state. */
export const PRICING_TIER_DEFAULT: PricingTier = "standard";

export const TIER_LABEL: Record<PricingTier, string> = {
  dayOne: `£${PRICING.dayOne} · first ${PRICING.dayOneFirstBand}`,
  dayOneNext: `£${PRICING.dayOneNext} · next ${DAY_ONE_NEXT_BAND}`,
  standard: `£${PRICING.standard} · standard`,
};

/**
 * Money for the calculator readouts. Shared by all three so a pair of figures
 * shown side by side is always formatted the same way.
 *
 * Two rules, in order:
 *   - At £100 and up, drop the pence. Precision that fine is noise next to a
 *     three-figure number, and the pence move on every slider step.
 *   - Below £100, keep the pence only when there are any. This is the rule
 *     that was missing: the Spotify panel rendered "£48.00" beside RAAYDR's
 *     "£712", so two figures meant to be read against each other disagreed on
 *     format. Sub-pound figures like £0.24 still need their pence and keep
 *     them.
 *
 * The whole-pound test is done on the rounded pence rather than with
 * Number.isInteger, because these values arrive from floating point
 * multiplication: 1000 * 0.2 * 0.24 is 48.00000000000001, which is not an
 * integer but must still print as "£48".
 */
export function formatGbp(value: number): string {
  const hasPence = Math.round(value * 100) % 100 !== 0;
  const digits = value >= 100 || !hasPence ? 0 : 2;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

/** What one fan is worth to an artist per month at 100% attention share. */
export function artistPerFan(tier: PricingTier = "standard"): number {
  return PER_FAN.artist[tier];
}

/**
 * Artist monthly earnings. Attention is a fraction (0..1): the share of each
 * fan's listening that goes to this artist.
 */
export function raaydrMonthly(
  fans: number,
  attention: number,
  tier: PricingTier = "standard"
): number {
  return fans * attention * artistPerFan(tier);
}

/** What one fan is worth to a tastemaker per month at 100% driven share. */
export function tastemakerPerFan(tier: PricingTier = "standard"): number {
  return PER_FAN.tastemaker[tier];
}

/**
 * Tastemaker monthly earnings from the ring-fenced fund. `share` is a fraction
 * (0..1): the portion of a follower's listening the tastemaker actually drove.
 */
export function tastemakerMonthly(
  fans: number,
  share: number,
  tier: PricingTier = "standard"
): number {
  return fans * share * tastemakerPerFan(tier);
}

/**
 * Qualitative milestone for a RAAYDR annual figure. No salary claims, no named
 * benchmarks.
 *
 * Thresholds raised on 3 August 2026. "Rent covered" began at £3,000 a year,
 * which is £250 a month and covers rent nowhere in the UK. The default view —
 * 1,000 fans at a 20% share, £712 a month, £8,544 a year — was being captioned
 * "Rent covered" on a figure that does not cover rent.
 *
 * Rent covered now starts at £14,400, which is £1,200 a month and roughly a
 * one-bed outside London. Overstating the caption undercuts every honest figure
 * next to it, which is the opposite of what this calculator is for.
 */
export function milestone(annual: number): string {
  if (annual < 14400) return "Side income";
  if (annual < 30000) return "Rent covered";
  if (annual < 50000) return "This is a living";
  return "Full time musician";
}

/**
 * Fan slider mapping: position 0..1 → 0..100,000 fans, logarithmic so the
 * few-hundred-to-few-thousand zone gets most of the travel. Default 1,000 sits
 * at the exact midpoint (position 0.5).
 */
const FAN_LOG_MIN = 1; // 10^1 = 10 fans at the bottom of the log range
const FAN_LOG_MAX = 5; // 10^5 = 100,000 fans at the top

export function sliderToFans(position: number): number {
  if (position <= 0) return 0;
  const raw = Math.pow(10, FAN_LOG_MIN + (FAN_LOG_MAX - FAN_LOG_MIN) * position);
  // Snap to two significant figures so the readout stays legible.
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)) - 1);
  return Math.round(raw / magnitude) * magnitude;
}

export function fansToSlider(fans: number): number {
  if (fans <= 0) return 0;
  const clamped = Math.min(Math.max(fans, 10), 100000);
  return (Math.log10(clamped) - FAN_LOG_MIN) / (FAN_LOG_MAX - FAN_LOG_MIN);
}

import { PER_FAN, type RatesTier } from "./raaydrRates";

/**
 * Calculator UI helpers. All money rates live in raaydr-rates.ts
 * (PER_FAN etc.); this module only holds the slider mapping and the
 * qualitative milestone, plus thin wrappers that read the rates.
 */

/** Pricing tier used across the calculators. Steady state is standard. */
export type PricingTier = RatesTier; // "standard" | "dayOne"

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

/** Qualitative milestone for a RAAYDR annual figure. No salary claims, no named benchmarks. */
export function milestone(annual: number): string {
  if (annual < 3000) return "Side income";
  if (annual < 12000) return "Rent covered";
  if (annual < 22000) return "This is a living";
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

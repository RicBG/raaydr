import { siteConfig } from "./siteConfig";

/** A typical listener's total plays per month, across all artists. */
export const BASE_MONTHLY_PLAYS = 300;

const { pricing, split, economics } = siteConfig;

/**
 * What one founding fan can generate for artists in a month:
 * founding − tastemakerFund − (founding − tastemakerFund) × platformShareOfRemainder
 * 5.99 − 0.99 − (5.00 × 0.30) = £3.50
 */
export function artistPerFan(): number {
  const afterFund = pricing.founding - split.tastemakerFund;
  return afterFund - afterFund * split.platformShareOfRemainder;
}

/** RAAYDR monthly earnings. Attention share decides the fraction of each fan's £3.50 that reaches you. */
export function raaydrMonthly(fans: number, attention: number): number {
  return fans * attention * artistPerFan();
}

/**
 * Spotify monthly earnings from the same fans and the same attention share.
 * Volume multiplies plays only — play count never moves the RAAYDR side.
 */
export function spotifyMonthly(
  fans: number,
  attention: number,
  volumeMultiplier: number
): number {
  return (
    fans *
    attention *
    BASE_MONTHLY_PLAYS *
    volumeMultiplier *
    economics.spotifyPerStream
  );
}

/** Casual monthly listeners needed on Spotify to match a RAAYDR monthly figure. */
export function matchListeners(raaydrMonthlyAmount: number): number {
  return (
    raaydrMonthlyAmount /
    (economics.matchStreamsPerListener * economics.spotifyPerStream)
  );
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

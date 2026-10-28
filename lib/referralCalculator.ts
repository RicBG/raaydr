import { REFERRAL_REWARD } from "./raaydrRates";

/**
 * The referral calculator's arithmetic and its words, written once for the page, the slider on the
 * artists page and the image Bumblebee posts. `work_items` 401, Ric's go on board rows 4232 and 4233.
 *
 * THE RULE IT STATES, EXACTLY: a pound a month (flat, in pounds, dollars or euros by where the person
 * is) for every listener you refer, for as long as they stay subscribed, with no limit on how many.
 * Rulings 2546, 2785 and 2811, paid from RAAYDR's own share. There is no cap anywhere in this file and
 * no cap on the input: a number field accepts any whole number, and the slider is only a way to reach
 * the common ones.
 *
 * THE YEARLY FIGURE IS A CONDITIONAL, AND SAYS SO. Twelve times the monthly figure is what it comes to
 * if every one of those listeners stays subscribed for the year. It is never shown as what somebody
 * "will earn". Nothing here projects how many listeners anyone will refer.
 */
export type ReferralCurrency = keyof typeof REFERRAL_REWARD;

export const REFERRAL_CURRENCIES: readonly ReferralCurrency[] = ["gbp", "usd", "eur"];

const SYMBOL: Record<ReferralCurrency, string> = { gbp: "£", usd: "$", eur: "€" };

/** The slider reaches this far. The number field does not stop here. */
export const SLIDER_MAX = 1000;
/** A ceiling on what the field will DISPLAY, so a pasted string of digits cannot print nonsense. */
export const FIELD_MAX = 1_000_000;

export type ReferralFigures = {
  referred: number;
  monthlyMinor: number;
  yearlyMinor: number;
};

/** Whole listeners, never negative, never a fraction; anything unreadable is zero. */
export function clampReferred(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(FIELD_MAX, Math.max(0, Math.floor(value)));
}

export function referralFigures(referred: number, currency: ReferralCurrency): ReferralFigures {
  const n = clampReferred(referred);
  const monthlyMinor = n * REFERRAL_REWARD[currency] * 100;
  return { referred: n, monthlyMinor, yearlyMinor: monthlyMinor * 12 };
}

/** "£1,200": whole units with a grouped thousands separator, because every figure here is whole. */
export function money(minor: number, currency: ReferralCurrency): string {
  return `${SYMBOL[currency]}${(minor / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

export function rewardLabel(currency: ReferralCurrency): string {
  return money(REFERRAL_REWARD[currency] * 100, currency);
}

/** The rule, as one sentence. The calculator page, the artists page and the image all say this. */
export function referralRule(currency: ReferralCurrency): string {
  return `${rewardLabel(currency)} a month for every listener you refer, for as long as they stay subscribed. There is no limit on how many.`;
}

export const REFERRAL_PAID_FROM = "Paid from RAAYDR's own share, never from another artist's.";

/** The figures Ric signs off: the same ladder on the page and in the board row. */
export const SIGN_OFF_LADDER = [1, 5, 10, 25, 50, 100, 250, 500, 1000] as const;

export function listeners(n: number): string {
  return `${n.toLocaleString("en-GB")} ${n === 1 ? "listener" : "listeners"}`;
}

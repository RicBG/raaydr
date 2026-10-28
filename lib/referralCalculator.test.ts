import { describe, expect, it } from "vitest";
import { REFERRAL_REWARD } from "./raaydrRates";
import {
  FIELD_MAX,
  SIGN_OFF_LADDER,
  clampReferred,
  listeners,
  money,
  referralFigures,
  referralRule,
} from "./referralCalculator";

// Work item 401. The rule is Ric's (platform board rows 2546, 2785, 2811): one pound a month per
// referred listener, for as long as they stay subscribed, no limit on how many.

describe("the reward is the ruled flat amount in each currency", () => {
  it("is one whole unit of each, which is what the platform pays", () => {
    // Pins the copy of the platform's REFERRAL_REWARD_MINOR (100 minor units each).
    expect(REFERRAL_REWARD).toEqual({ gbp: 1, usd: 1, eur: 1 });
  });
});

describe("referralFigures", () => {
  it("is the reward times the listeners, monthly, and twelve times that yearly", () => {
    expect(referralFigures(100, "gbp")).toEqual({ referred: 100, monthlyMinor: 10_000, yearlyMinor: 120_000 });
    expect(referralFigures(1, "usd")).toEqual({ referred: 1, monthlyMinor: 100, yearlyMinor: 1_200 });
  });

  it("has no cap on how many can be referred, only a ceiling on what the field prints", () => {
    expect(referralFigures(FIELD_MAX, "gbp").monthlyMinor).toBe(FIELD_MAX * 100);
    expect(clampReferred(10_000_000)).toBe(FIELD_MAX);
  });

  it("is never a fraction of a listener or below zero, and unreadable input is zero", () => {
    expect(clampReferred(12.9)).toBe(12);
    expect(clampReferred(-4)).toBe(0);
    expect(clampReferred(Number.NaN)).toBe(0);
    expect(clampReferred(Number.POSITIVE_INFINITY)).toBe(0);
    expect(referralFigures(0, "eur").monthlyMinor).toBe(0);
  });

  it("is a monthly figure per listener that does not change with how many there are", () => {
    // Guards against a tier or a cap creeping in: the thousandth listener pays the same as the first.
    const step = referralFigures(2, "gbp").monthlyMinor - referralFigures(1, "gbp").monthlyMinor;
    expect(referralFigures(1000, "gbp").monthlyMinor - referralFigures(999, "gbp").monthlyMinor).toBe(step);
  });
});

describe("the words", () => {
  it("states the whole rule, including that there is no limit", () => {
    const rule = referralRule("gbp");
    expect(rule).toContain("a month for every listener you refer");
    expect(rule).toContain("for as long as they stay subscribed");
    expect(rule).toContain("no limit on how many");
  });

  it("never says the reward is paid once", () => {
    for (const c of ["gbp", "usd", "eur"] as const) {
      expect(referralRule(c)).not.toMatch(/once|one off|one-off|per signup/i);
    }
  });

  it("writes the symbol of the currency and groups thousands", () => {
    expect(money(120_000, "gbp")).toBe("£1,200");
    expect(money(120_000, "usd")).toBe("$1,200");
    expect(money(120_000, "eur")).toBe("€1,200");
  });

  it("says listener once and listeners otherwise", () => {
    expect(listeners(1)).toBe("1 listener");
    expect(listeners(1000)).toBe("1,000 listeners");
  });
});

describe("the ladder Ric signs off", () => {
  it("is increasing and every rung is a whole number of listeners", () => {
    const ladder = [...SIGN_OFF_LADDER];
    expect(ladder).toEqual([...ladder].sort((a, b) => a - b));
    for (const n of ladder) expect(Number.isInteger(n)).toBe(true);
  });
});

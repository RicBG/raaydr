import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DAY_ONE_TERMS } from "./dayOneTerms";
import { faqData } from "./faqData";
import { DEFAULT_OFFER } from "./waitlistOffers";
import { PRICING, SPLIT } from "./raaydrRates";

/**
 * The Day One price, and the listener maths, guarded by what the site publishes. The price is kept
 * for good, including through a cancel and a return: Ric, 29 October 2026, platform board rows 4354,
 * 4355 and 4358, reversing the 21 October ruling (rows 3657 and 3658).
 */
const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** Every file the public site reads its Day One wording from. */
const PUBLISHED = [
  "app/for-listeners/page.tsx",
  "components/AboutContent.tsx",
  "components/sections/FirstWave.tsx",
  "components/sections/Calculator.tsx",
  "lib/faqData.ts",
  "lib/waitlistOffers.ts",
  "public/llms.txt",
  ...readdirSync(join(ROOT, "content/pulse")).map((f) => `content/pulse/${f}`),
];

describe("Day One terms", () => {
  it("says the ruled thing, with the price read from the rates file", () => {
    expect(DAY_ONE_TERMS.you).toBe(
      `£${PRICING.dayOne} a month for good, and your Day One tape and number are yours too`,
    );
    expect(DAY_ONE_TERMS.they).toContain("a month for good");
  });

  it("no longer says the price holds only while subscribed, or that a return costs the standard price", () => {
    for (const file of PUBLISHED) {
      const text = stripComments(read(file)).replace(/\s+/g, " ");
      expect(text, file).not.toMatch(/(stay|while you|while they) subscribed[^.]{0,80}Day One|Day One[^.]{0,120}(for as long as|while) (you|they) stay subscribed/i);
      expect(text, file).not.toMatch(/Price holds while they stay subscribed/i);
      expect(text, file).not.toMatch(/(you|they) return at £/i);
    }
  });

  it("keeps to the one phrase, 'for good', and not the 24 September 'locked forever' wording", () => {
    /* The ruling is the same one, restored; the sentence is not. One phrase, from one place. */
    for (const file of PUBLISHED) {
      const text = stripComments(read(file));
      expect(text, file).not.toMatch(/locked? forever/i);
      expect(text, file).not.toMatch(/lock £/i);
      expect(text, file).not.toMatch(/Day Ones lock/i);
    }
  });

  it("reaches the FAQ schema, the homepage offer line and llms.txt", () => {
    const all = JSON.stringify(faqData);
    expect(all).toContain(DAY_ONE_TERMS.they);
    expect(all).toContain(DAY_ONE_TERMS.you);
    expect(DEFAULT_OFFER).toContain(DAY_ONE_TERMS.they);
    expect(read("public/llms.txt").replace(/\s+/g, " ")).toContain(
      `£${PRICING.dayOne} a month for good, and their Day One tape and number are theirs too`,
    );
  });

  it("never publishes that support can reinstate the price", () => {
    for (const file of PUBLISHED) {
      expect(read(file), file).not.toMatch(/reinstat|discretion|restore your (price|£)/i);
    }
  });
});

describe("the listener maths", () => {
  const SOURCE = stripComments(read("components/sections/WhereYourMoneyGoes.tsx"));

  it("takes costs off first and splits what is left, in two steps", () => {
    expect(SOURCE).toContain("Step 1");
    expect(SOURCE).toContain("Step 2");
    expect(SOURCE.indexOf("Step 1")).toBeLessThan(SOURCE.indexOf("Step 2"));
    expect(SOURCE).toContain("What is left splits");
  });

  it("reads every figure from the rates file and types none", () => {
    expect(SOURCE).toContain("SPLIT.artists");
    expect(SOURCE).toContain("SPLIT.tastemakers");
    expect(SOURCE).toContain("SPLIT.raaydr");
    expect(SOURCE).not.toMatch(/\b(55|35)\s?%/);
    expect(SOURCE).not.toMatch(/up to 10%/);
  });

  it("splits what is left into shares that add to exactly 100", () => {
    expect(SPLIT.artists + SPLIT.tastemakers + SPLIT.raaydr).toBe(100);
  });
});

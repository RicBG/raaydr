import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allReelCopy, BANNED_ON_SCREEN, SAT_17_REEL } from "./sat-17";

/**
 * The reel's copy is the plan's copy. Row 3308 (corrected by 3539) is what Ric said
 * yes to, so a preview that drifts from it is previewing something he has not seen.
 * These are the lines from that row, verbatim.
 */
const PLAN_SAT_17 = [
  "Things nobody tells you about buying streams",
  "Yes, you can buy them.",
  "Bot farms run on play counts.",
  "Bought plays dilute the pot real fans pay into.",
  "RAAYDR shows no public play counts at all.",
  "Nothing to fake.",
];

describe("Sat 17 reel", () => {
  it("carries the five cards and the hook from row 3308, word for word", () => {
    expect(SAT_17_REEL.hook.line).toBe(PLAN_SAT_17[0]);
    expect(SAT_17_REEL.cards.map((c) => c.line)).toEqual(PLAN_SAT_17.slice(1));
  });

  it("has no dashes and no banned words anywhere a viewer can read", () => {
    for (const s of allReelCopy()) {
      expect(s).not.toMatch(/[–—]/);
      for (const banned of BANNED_ON_SCREEN) {
        expect(s.toLowerCase()).not.toContain(banned);
      }
    }
  });

  it("runs in order with a gap between cards and ends before the loop does", () => {
    const beats = [SAT_17_REEL.hook, ...SAT_17_REEL.cards, SAT_17_REEL.cta];
    for (let i = 0; i < beats.length; i++) {
      expect(beats[i].until).toBeGreaterThan(beats[i].at);
      if (i > 0) expect(beats[i].at).toBeGreaterThanOrEqual(beats[i - 1].until);
    }
    expect(SAT_17_REEL.cta.until).toBeLessThan(SAT_17_REEL.duration);
    // Instagram's own guidance: the hook lands in the first two seconds.
    expect(SAT_17_REEL.hook.at).toBe(0);
    expect(SAT_17_REEL.hook.until).toBeGreaterThanOrEqual(2);
  });

  it("points the DM at a Pulse post that exists and makes the same claims", () => {
    const slug = SAT_17_REEL.dmLink.replace("/pulse/", "");
    const md = readFileSync(join(__dirname, "..", "..", "content", "pulse", `${slug}.md`), "utf8");
    expect(md).toContain("no public play counts");
    expect(md.toLowerCase()).toContain("bot farm");
    expect(md).toContain("dilute");
  });

  it("uses a background loop and a wordmark that are real files in public/", () => {
    const pub = join(__dirname, "..", "..", "public");
    expect(() => readFileSync(join(pub, "media", `${SAT_17_REEL.background}.mp4`))).not.toThrow();
    expect(() =>
      readFileSync(join(pub, "media", `${SAT_17_REEL.background}-poster.jpg`)),
    ).not.toThrow();
    expect(() => readFileSync(join(pub, "logo", "raaydr-wordmark-blip-ink.svg"))).not.toThrow();
  });
});

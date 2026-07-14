import { describe, expect, it } from "vitest";
import {
  artistPerFan,
  fansToSlider,
  matchListeners,
  milestone,
  raaydrMonthly,
  sliderToFans,
  spotifyMonthly,
} from "./calculator";

describe("artistPerFan", () => {
  it("derives £3.50 from the founding price split", () => {
    // 5.99 − 0.99 − (5.00 × 0.30) = 3.50
    expect(artistPerFan()).toBeCloseTo(3.5, 10);
  });
});

describe("default state (1,000 fans, 40% attention, 1x volume)", () => {
  const fans = 1000;
  const attention = 0.4;

  it("RAAYDR pays £1,400/month (£16,800/year)", () => {
    expect(raaydrMonthly(fans, attention)).toBeCloseTo(1400, 6);
    expect(raaydrMonthly(fans, attention) * 12).toBeCloseTo(16800, 6);
  });

  it("Spotify pays ≈£360/month (£4,320/year)", () => {
    expect(spotifyMonthly(fans, attention, 1)).toBeCloseTo(360, 6);
    expect(spotifyMonthly(fans, attention, 1) * 12).toBeCloseTo(4320, 6);
  });

  it("needs ≈117,000 casual monthly listeners on Spotify to match", () => {
    const match = matchListeners(raaydrMonthly(fans, attention));
    expect(match).toBeCloseTo(116666.67, 1);
    expect(Math.round(match / 1000) * 1000).toBe(117000);
  });
});

describe("volume multiplier asymmetry", () => {
  it("moves the Spotify figure", () => {
    expect(spotifyMonthly(1000, 0.4, 2)).toBeCloseTo(720, 6);
    expect(spotifyMonthly(1000, 0.4, 0.5)).toBeCloseTo(180, 6);
  });

  it("never appears in the RAAYDR formula", () => {
    // raaydrMonthly takes no volume argument at all — the asymmetry is structural.
    expect(raaydrMonthly.length).toBe(2);
  });
});

describe("attention share moves both sides symmetrically", () => {
  it("doubling attention doubles both figures", () => {
    expect(raaydrMonthly(1000, 0.8)).toBeCloseTo(raaydrMonthly(1000, 0.4) * 2, 6);
    expect(spotifyMonthly(1000, 0.8, 1)).toBeCloseTo(
      spotifyMonthly(1000, 0.4, 1) * 2,
      6
    );
  });

  it("one fan at full attention generates exactly £3.50", () => {
    expect(raaydrMonthly(1, 1)).toBeCloseTo(3.5, 10);
  });
});

describe("milestone captions on the annual figure", () => {
  it("matches the thresholds", () => {
    expect(milestone(0)).toBe("Side income");
    expect(milestone(2999)).toBe("Side income");
    expect(milestone(3000)).toBe("Rent covered");
    expect(milestone(11999)).toBe("Rent covered");
    expect(milestone(12000)).toBe("This is a living");
    expect(milestone(21999)).toBe("This is a living");
    expect(milestone(22000)).toBe("Full time musician");
    expect(milestone(16800)).toBe("This is a living"); // the default state
  });
});

describe("fan slider log mapping", () => {
  it("puts the default 1,000 fans at the midpoint of the travel", () => {
    expect(fansToSlider(1000)).toBeCloseTo(0.5, 10);
    expect(sliderToFans(0.5)).toBe(1000);
  });

  it("caps at 100,000 and bottoms out at 0", () => {
    expect(sliderToFans(1)).toBe(100000);
    expect(sliderToFans(0)).toBe(0);
  });

  it("gives the few-hundred-to-few-thousand zone most of the travel", () => {
    // 100 → 10,000 fans spans the middle half of the slider.
    expect(fansToSlider(100)).toBeCloseTo(0.25, 10);
    expect(fansToSlider(10000)).toBeCloseTo(0.75, 10);
  });
});

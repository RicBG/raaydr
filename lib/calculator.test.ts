import { describe, expect, it } from "vitest";
import {
  artistPerFan,
  fansToSlider,
  milestone,
  raaydrMonthly,
  sliderToFans,
  tastemakerMonthly,
  tastemakerPerFan,
} from "./calculator";
import { PER_FAN, spotifyEquivalentListeners } from "./raaydrRates";

describe("artistPerFan", () => {
  it("reads the standard per-fan rate by default", () => {
    expect(artistPerFan()).toBeCloseTo(PER_FAN.artist.standard, 10);
    expect(artistPerFan("standard")).toBeCloseTo(3.57, 10);
  });

  it("reads the Day One per-fan rate", () => {
    expect(artistPerFan("dayOne")).toBeCloseTo(2.46, 10);
  });
});

describe("tastemakerPerFan", () => {
  it("reads the per-fan tastemaker rate per tier", () => {
    expect(tastemakerPerFan()).toBeCloseTo(0.97, 10);
    expect(tastemakerPerFan("standard")).toBeCloseTo(0.97, 10);
    expect(tastemakerPerFan("dayOne")).toBeCloseTo(0.67, 10);
  });
});

describe("tastemakerMonthly", () => {
  it("scales per-fan by fan count and driven share", () => {
    expect(tastemakerMonthly(1000, 0.25)).toBeCloseTo(1000 * 0.97 * 0.25, 6);
  });
});

describe("raaydrMonthly (standard, default 20% attention)", () => {
  const fans = 1000;
  const attention = 0.2;

  it("multiplies fans, attention and the standard per-fan rate", () => {
    expect(raaydrMonthly(fans, attention)).toBeCloseTo(1000 * 3.57 * 0.2, 6);
  });

  it("never takes a volume argument — the asymmetry is structural", () => {
    expect(raaydrMonthly.length).toBe(2);
  });
});

describe("spotifyEquivalentListeners", () => {
  it("divides monthly earnings by the per-monthly-listener rate", () => {
    expect(spotifyEquivalentListeners(714)).toBe(Math.round(714 / 0.012));
  });
});

describe("attention share scales earnings linearly", () => {
  it("doubling attention doubles the figure", () => {
    expect(raaydrMonthly(1000, 0.4)).toBeCloseTo(raaydrMonthly(1000, 0.2) * 2, 6);
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
    expect(fansToSlider(100)).toBeCloseTo(0.25, 10);
    expect(fansToSlider(10000)).toBeCloseTo(0.75, 10);
  });
});

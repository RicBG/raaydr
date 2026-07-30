import { describe, expect, it } from "vitest";
import {
  artistPerFan,
  fansToSlider,
  milestone,
  raaydrMonthly,
  sliderToFans,
  tastemakerMonthly,
  tastemakerPerFan,
  PRICING_TIERS,
  PRICING_TIER_DEFAULT,
  TIER_LABEL,
} from "./calculator";
import { PER_FAN, floorToPence, spotifyEquivalentListeners } from "./raaydrRates";

describe("floorToPence", () => {
  it("floors to whole pence rather than rounding", () => {
    expect(floorToPence(3.5665)).toBeCloseTo(3.56, 10);
    expect(floorToPence(3.569)).toBeCloseTo(3.56, 10);
    expect(floorToPence(2.4699)).toBeCloseTo(2.46, 10);
  });

  it("leaves an exact whole-penny amount alone despite float error", () => {
    // 3.56 * 100 is 355.99999999999994 in binary floating point.
    expect(floorToPence(3.56)).toBeCloseTo(3.56, 10);
    expect(floorToPence(0.97)).toBeCloseTo(0.97, 10);
    expect(floorToPence(0.1 + 0.2)).toBeCloseTo(0.3, 10);
  });
});

describe("artistPerFan", () => {
  it("reads the standard per-fan rate by default", () => {
    expect(artistPerFan()).toBeCloseTo(PER_FAN.artist.standard, 10);
    expect(artistPerFan("standard")).toBeCloseTo(3.56, 10);
  });

  it("reads both Day One band rates", () => {
    expect(artistPerFan("dayOne")).toBeCloseTo(2.46, 10);
    expect(artistPerFan("dayOneNext")).toBeCloseTo(2.83, 10);
  });

  // Two bands inside the same cohort, so the ladder has to stay monotonic:
  // the earliest band can never be worth more to an artist than a later one.
  it("rises with the price band", () => {
    expect(artistPerFan("dayOne")).toBeLessThan(artistPerFan("dayOneNext"));
    expect(artistPerFan("dayOneNext")).toBeLessThan(artistPerFan("standard"));
  });

  it("never presents £3.57, the rate the locked economics doc forbids", () => {
    expect(artistPerFan("standard")).toBeLessThan(3.57);
  });
});

describe("tier selector options", () => {
  it("offers all three bands, cheapest first, and defaults to standard", () => {
    expect([...PRICING_TIERS]).toEqual(["dayOne", "dayOneNext", "standard"]);
    expect(PRICING_TIER_DEFAULT).toBe("standard");
  });

  it("builds its labels from the pricing constants", () => {
    expect(TIER_LABEL.dayOne).toBe("£6.99 · first 250");
    expect(TIER_LABEL.dayOneNext).toBe("£7.99 · next 750");
    expect(TIER_LABEL.standard).toBe("£9.99 · standard");
  });
});

describe("tastemakerPerFan", () => {
  it("reads the per-fan tastemaker rate per tier", () => {
    expect(tastemakerPerFan()).toBeCloseTo(0.97, 10);
    expect(tastemakerPerFan("standard")).toBeCloseTo(0.97, 10);
    expect(tastemakerPerFan("dayOne")).toBeCloseTo(0.67, 10);
    expect(tastemakerPerFan("dayOneNext")).toBeCloseTo(0.77, 10);
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

  // The headline figure the calculator shows on load. Pinned exactly: it is
  // the number the locked economics doc constrains, and it drifted to £714
  // once already by rounding the per-fan rate up to £3.57.
  it("is exactly £712 at 1,000 fans and 20% attention", () => {
    expect(raaydrMonthly(fans, attention)).toBeCloseTo(712, 10);
  });

  it("is exactly £492 on the £6.99 band at the same inputs", () => {
    expect(raaydrMonthly(fans, attention, "dayOne")).toBeCloseTo(492, 10);
  });

  it("is exactly £566 on the £7.99 band at the same inputs", () => {
    expect(raaydrMonthly(fans, attention, "dayOneNext")).toBeCloseTo(566, 10);
  });

  it("multiplies fans, attention and the standard per-fan rate", () => {
    expect(raaydrMonthly(fans, attention)).toBeCloseTo(1000 * 3.56 * 0.2, 6);
  });

  it("never takes a volume argument — the asymmetry is structural", () => {
    expect(raaydrMonthly.length).toBe(2);
  });
});

describe("spotifyEquivalentListeners", () => {
  it("divides monthly earnings by the per-monthly-listener rate", () => {
    expect(spotifyEquivalentListeners(712)).toBe(Math.round(712 / 0.012));
  });

  // The comparison line is recomputed from the corrected figure, so the
  // default view reads ~59,300 monthly listeners, not the old ~59,500.
  it("matches the default view's £712 against Spotify", () => {
    expect(spotifyEquivalentListeners(raaydrMonthly(1000, 0.2))).toBe(59333);
  });

  // Each band gets its own comparison line, all from the same £0.012 anchor.
  it("recomputes the line for both Day One bands", () => {
    expect(spotifyEquivalentListeners(raaydrMonthly(1000, 0.2, "dayOne"))).toBe(41000);
    expect(spotifyEquivalentListeners(raaydrMonthly(1000, 0.2, "dayOneNext"))).toBe(47167);
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

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
import {
  CANONICAL,
  DISTRIBUTABLE,
  PER_FAN,
  PLATFORM_PER_STREAM_ESTIMATES,
  SPLIT,
  SPOTIFY,
  engagedFanMonthly,
  floorToPence,
  spotifyEquivalentStreams,
} from "./raaydrRates";

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
    expect(artistPerFan("dayOneNext")).toBeCloseTo(2.82, 10);
  });

  // Two bands inside the same cohort, so the ladder has to stay monotonic:
  // the earliest band can never be worth more to an artist than a later one.
  it("rises with the price band", () => {
    expect(artistPerFan("dayOne")).toBeLessThan(artistPerFan("dayOneNext"));
    expect(artistPerFan("dayOneNext")).toBeLessThan(artistPerFan("standard"));
  });

  it("floors the £7.99 band to £2.82, never £2.83", () => {
    expect(artistPerFan("dayOneNext")).toBeLessThan(2.83);
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
    expect(tastemakerPerFan("dayOneNext")).toBeCloseTo(0.76, 10);
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

  it("is exactly £564 on the £7.99 band at the same inputs", () => {
    expect(raaydrMonthly(fans, attention, "dayOneNext")).toBeCloseTo(564, 10);
  });

  it("multiplies fans, attention and the standard per-fan rate", () => {
    expect(raaydrMonthly(fans, attention)).toBeCloseTo(1000 * 3.56 * 0.2, 6);
  });

  it("never takes a volume argument — the asymmetry is structural", () => {
    expect(raaydrMonthly.length).toBe(2);
  });
});

// Was spotifyEquivalentListeners, pinned at 59,333 / 41,000 / 47,000 against a
// £0.012 per-monthly-listener rate. That rate was unsourced and contradicted by
// our own copy, so it was retired rather than re-picked. The reach line is now
// expressed in streams, which needs only the observed per-stream rate and makes
// no claim about how many people are doing the listening.
describe("spotifyEquivalentStreams", () => {
  it("divides monthly earnings by the observed per-stream rate", () => {
    expect(spotifyEquivalentStreams(712)).toBe(Math.round(712 / 0.003));
  });

  it("matches the default view's £712 against Spotify", () => {
    expect(spotifyEquivalentStreams(raaydrMonthly(1000, 0.2))).toBe(237333);
  });

  it("recomputes the line for both Day One bands", () => {
    expect(spotifyEquivalentStreams(raaydrMonthly(1000, 0.2, "dayOne"))).toBe(164000);
    expect(spotifyEquivalentStreams(raaydrMonthly(1000, 0.2, "dayOneNext"))).toBe(188000);
  });

  // The invariance check: the streams you would need is a fixed multiple of the
  // streams your actual fans give you, at every attention share. If this ever
  // drifts, the two sides of the comparison have stopped matching.
  it("stays at the canonical multiple across every attention share", () => {
    for (const attention of [0.1, 0.2, 0.4, 1]) {
      const needed = spotifyEquivalentStreams(raaydrMonthly(1000, attention));
      const given = 1000 * attention * SPOTIFY.engagedFanStreamsPerMonth;
      expect(needed / given).toBeCloseTo(CANONICAL.artistPerFan / CANONICAL.spotifyPerFan, 3);
    }
  });
});

// DISTRIBUTABLE.standard is published from the fitted deduction stack, not
// derived from PER_FAN, so it cannot be asserted equal to anything. What it
// must do is stay consistent with the rates the site publishes beside it.
describe("the published distributable", () => {
  it("sits inside the range the floored artist rate implies", () => {
    const low = PER_FAN.artist.standard / (SPLIT.artists / 100);
    const high = (PER_FAN.artist.standard + 0.01) / (SPLIT.artists / 100);
    expect(DISTRIBUTABLE.standard).toBeGreaterThanOrEqual(low);
    expect(DISTRIBUTABLE.standard).toBeLessThan(high);
  });

  it("reproduces both published standard-tier per-fan rates", () => {
    const d = DISTRIBUTABLE.standard;
    expect(floorToPence(d * (SPLIT.artists / 100))).toBeCloseTo(PER_FAN.artist.standard, 10);
    expect(floorToPence(d * (SPLIT.tastemakers / 100))).toBeCloseTo(PER_FAN.tastemaker.standard, 10);
  });
});

// The per-stream comparison table computes both of its columns from these, so
// a rate and the per-fan figure printed beside it cannot drift apart. Apple's
// row previously read £0.62 against a stated £0.008, which gives £0.64.
describe("other platforms' engaged-fan figures", () => {
  it("derives each from the rate printed beside it", () => {
    expect(engagedFanMonthly(PLATFORM_PER_STREAM_ESTIMATES.appleMusic)).toBeCloseTo(0.64, 10);
    expect(engagedFanMonthly(PLATFORM_PER_STREAM_ESTIMATES.youtubeMusic)).toBeCloseTo(0.12, 10);
    expect(engagedFanMonthly(SPOTIFY.perStream)).toBeCloseTo(CANONICAL.spotifyPerFan, 10);
  });
});

describe("the canonical claim", () => {
  it("leads with the realistic figure, not the ceiling", () => {
    expect(CANONICAL.claim).toBe(
      "A fan who gives you a fifth of their listening is worth 71p a month, " +
        "against 4.8p on Spotify. One who plays nothing but you is worth £3.56."
    );
  });

  // "a fifth" is ATTENTION_DEFAULT in words. If the default moves, the wording
  // is wrong and this catches it before it ships.
  it("states the share the wording claims", () => {
    expect(CANONICAL.typicalAttentionPct).toBe(20);
  });

  it("never exposes the realistic figure without its comparison", () => {
    expect(CANONICAL.typicalPair).toContain("71p");
    expect(CANONICAL.typicalPair).toContain("4.8p");
  });

  it("derives the multiple rather than carrying a typed one", () => {
    expect(CANONICAL.multiple).toBe(
      Math.round(CANONICAL.artistPerFan / CANONICAL.spotifyPerFan)
    );
    expect(CANONICAL.multiple).toBe(15);
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

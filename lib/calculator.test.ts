import { describe, expect, it } from "vitest";
import {
  artistPerFan,
  formatGbp,
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
  equivalentStreams,
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

describe("formatGbp", () => {
  // The bug this rule exists for: the Spotify panel rendered "£48.00" beside
  // RAAYDR's "£712". Two figures meant to be read against each other must not
  // disagree on format.
  it("drops the pence when a sub-£100 figure has none", () => {
    expect(formatGbp(48)).toBe("£48");
    expect(formatGbp(712)).toBe("£712");
  });

  it("survives the float error these values actually arrive with", () => {
    // 1,000 fans at 20% of £0.24 is 48.00000000000001, not an integer.
    expect(formatGbp(1000 * 0.2 * 0.24)).toBe("£48");
    expect(formatGbp(0.1 + 0.2)).toBe("£0.30");
  });

  it("keeps the pence on sub-£100 figures that have them", () => {
    expect(formatGbp(0.24)).toBe("£0.24");
    expect(formatGbp(3.56)).toBe("£3.56");
    expect(formatGbp(48.5)).toBe("£48.50");
  });

  it("still drops the pence at £100 and above", () => {
    expect(formatGbp(783.2)).toBe("£783");
    expect(formatGbp(8544)).toBe("£8,544");
  });

  it("formats the default view's RAAYDR figure", () => {
    expect(formatGbp(raaydrMonthly(1000, 0.2))).toBe("£712");
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

  // This replaces a test that pinned a fixed 15x ratio between the streams
  // needed and the streams an "engaged fan" was assumed to give. That second
  // quantity was 80 plays a month with no source behind it, so the ratio it
  // held constant was an artefact of the assumption rather than a property of
  // the model. What is actually true, and all that is claimed now, is that the
  // figure is earnings divided by the observed rate — nothing else enters it.
  it("is exactly earnings over the observed rate at every attention share", () => {
    for (const attention of [0.1, 0.2, 0.4, 1]) {
      const earnings = raaydrMonthly(1000, attention);
      expect(spotifyEquivalentStreams(earnings)).toBe(
        Math.round(earnings / SPOTIFY.perStream)
      );
    }
  });

  // The guard the old design needed and did not have: no listening-volume
  // input may reach this figure. If a constant like the retired 80-plays-a-
  // month ever returns to SPOTIFY, this is where it should be caught.
  it("takes no input but earnings", () => {
    expect(spotifyEquivalentStreams.length).toBe(1);
    expect(Object.keys(SPOTIFY)).toEqual(["perStream", "subscriptionPrice"]);
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
// a rate and the play count printed beside it cannot drift apart. Apple's row
// previously read £0.62 against a stated £0.008, which gives £0.64.
//
// The column itself changed on 3 August 2026: it read "one engaged fan is
// worth £x", each rate multiplied by 80 assumed plays a month. It is now the
// plays needed to match £3.56 — the same rates, divided rather than
// multiplied, with no assumption about anyone's listening.
describe("the per-platform plays-to-match column", () => {
  it("derives each from the rate printed beside it", () => {
    const perFan = PER_FAN.artist.standard;
    expect(equivalentStreams(perFan, PLATFORM_PER_STREAM_ESTIMATES.appleMusic)).toBe(445);
    expect(equivalentStreams(perFan, PLATFORM_PER_STREAM_ESTIMATES.youtubeMusic)).toBe(2373);
    expect(equivalentStreams(perFan, SPOTIFY.perStream)).toBe(CANONICAL.ceilingStreams);
  });
});

describe("the canonical claim", () => {
  it("leads with the realistic figure, not the ceiling", () => {
    expect(CANONICAL.claim).toBe(
      "A fan who gives you a fifth of their listening is worth 71p a month. " +
        "Earning that from Spotify instead takes around 237 plays. " +
        "A fan who plays nothing but you is worth £3.56, or around 1,187 plays."
    );
  });

  // "a fifth" is ATTENTION_DEFAULT in words. If the default moves, the wording
  // is wrong and this catches it before it ships.
  it("states the share the wording claims", () => {
    expect(CANONICAL.typicalAttentionPct).toBe(20);
  });

  it("never exposes the realistic figure without its comparison", () => {
    expect(CANONICAL.typicalPair).toContain("71p");
    expect(CANONICAL.typicalPair).toContain("237");
  });

  it("states both stream figures as arithmetic on the observed rate alone", () => {
    expect(CANONICAL.typicalStreams).toBe(
      Math.round(floorToPence(PER_FAN.artist.standard * 0.2) / SPOTIFY.perStream)
    );
    expect(CANONICAL.ceilingStreams).toBe(
      Math.round(PER_FAN.artist.standard / SPOTIFY.perStream)
    );
  });

  // Retired 3 August 2026. A dimensionless multiple cannot be formed without
  // dividing by a per-fan Spotify figure, and that figure cannot be built
  // without assuming a monthly play count. The old 15x was
  // Math.round(3.56 / 0.24), where 0.24 was £0.003 x 80 unsourced plays; at a
  // more ordinary 800 to 1,000 plays a month the same sum gives roughly 1.2x.
  // Nothing may reintroduce one without a published source for the volume.
  it("carries no multiple and no per-fan Spotify rate", () => {
    expect(CANONICAL).not.toHaveProperty("multiple");
    expect(CANONICAL).not.toHaveProperty("spotifyPerFan");
    expect(CANONICAL.claim).not.toMatch(/\d+x\b/);
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

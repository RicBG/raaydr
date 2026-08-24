import { describe, expect, it } from "vitest";
import {
  ARTIST_NAME_MAX_LENGTH,
  WAITLIST_GENRES,
  isWaitlistGenreCode,
} from "./waitlistGenres";

// The list is a hand-copied snapshot of the platform's taxonomy, so nothing
// automated will notice if a copy goes wrong. These are the properties the
// copy has to hold whatever the platform does next.
describe("waitlist genres", () => {
  it("holds the fourteen platform genres plus Other", () => {
    expect(WAITLIST_GENRES).toHaveLength(15);
  });

  it("puts Other last, after the real genres", () => {
    expect(WAITLIST_GENRES.at(-1)).toEqual({ code: "other", label: "Other" });
    expect(
      WAITLIST_GENRES.slice(0, -1).some((g) => g.code === "other")
    ).toBe(false);
  });

  it("has unique, slug-shaped codes and a label for each", () => {
    const codes = WAITLIST_GENRES.map((g) => g.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const { code, label } of WAITLIST_GENRES) {
      expect(code).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(label.trim()).toBe(label);
      expect(label).not.toBe("");
    }
  });

  it("keeps the code the platform's live rows already carry", () => {
    // Production track rows hold `rnb-soul`. If this ever stops matching, a
    // waitlist signup and that artist's uploads stop lining up.
    expect(isWaitlistGenreCode("rnb-soul")).toBe(true);
  });

  it("recognises only its own codes", () => {
    expect(isWaitlistGenreCode("other")).toBe(true);
    expect(isWaitlistGenreCode("R&B & Soul")).toBe(false);
    expect(isWaitlistGenreCode("uk-rap")).toBe(false); // a subgenre, not copied
    expect(isWaitlistGenreCode("")).toBe(false);
  });

  it("caps artist names at a length a real band name fits inside", () => {
    expect(ARTIST_NAME_MAX_LENGTH).toBeGreaterThanOrEqual(60);
  });
});

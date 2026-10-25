import { describe, expect, it } from "vitest";
import { SOCIETIES, showSocietyLogos } from "./societies";

describe("showSocietyLogos", () => {
  it("is off in production and anywhere nothing is set", () => {
    expect(showSocietyLogos({ VERCEL_ENV: "production" })).toBe(false);
    expect(showSocietyLogos({})).toBe(false);
    expect(showSocietyLogos({ VERCEL_ENV: "development" })).toBe(false);
  });

  it("is on in a preview, so Ric can see what he is approving", () => {
    expect(showSocietyLogos({ VERCEL_ENV: "preview" })).toBe(true);
  });

  it("can be turned on in production by Ric, and off in a preview", () => {
    expect(
      showSocietyLogos({ VERCEL_ENV: "production", SHOW_SOCIETY_LOGOS: "true" }),
    ).toBe(true);
    expect(
      showSocietyLogos({ VERCEL_ENV: "preview", SHOW_SOCIETY_LOGOS: "false" }),
    ).toBe(false);
  });
});

describe("SOCIETIES", () => {
  it("has seven, each with a name for its alt text", () => {
    expect(SOCIETIES).toHaveLength(7);
    for (const society of SOCIETIES) expect(society.name.length).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { COUNTRY_HEADER, countryFromHeaders } from "./signupCountry";

const headersWith = (value?: string) =>
  new Headers(value === undefined ? {} : { [COUNTRY_HEADER]: value });

describe("countryFromHeaders", () => {
  it("reads a two letter code", () => {
    expect(countryFromHeaders(headersWith("GB"))).toBe("GB");
  });

  it("normalises case and whitespace", () => {
    expect(countryFromHeaders(headersWith(" us "))).toBe("US");
  });

  it("is null when the header is absent, never a guess", () => {
    expect(countryFromHeaders(headersWith())).toBeNull();
  });

  it("is null for anything that is not exactly two letters", () => {
    for (const bad of ["", "G", "GBR", "G1", "12", "United Kingdom", "GB;DROP", "G B"]) {
      expect(countryFromHeaders(headersWith(bad))).toBeNull();
    }
  });

  it("reads the Vercel header and not an address header", () => {
    expect(COUNTRY_HEADER).toBe("x-vercel-ip-country");
    const h = new Headers({ "x-forwarded-for": "203.0.113.9", "x-real-ip": "203.0.113.9" });
    expect(countryFromHeaders(h)).toBeNull();
  });
});

describe("the waitlist route", () => {
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const route = strip(readFileSync(`${import.meta.dirname}/../app/api/waitlist/route.ts`, "utf8"));

  it("sends the country only when there is one, and steps back when the migration is not applied", () => {
    expect(route).toContain("countryFromHeaders(request.headers)");
    expect(route).toContain("p_country: country");
    expect(route).toMatch(/PGRST202[\s\S]*country migration not applied/);
  });

  it("the country path reads no address header, and stores nothing but the code", () => {
    const lib = strip(readFileSync(`${import.meta.dirname}/signupCountry.ts`, "utf8"));
    expect(lib).not.toMatch(/x-forwarded-for|x-real-ip|cf-connecting-ip|true-client-ip/i);
    // What reaches the database is `p_country` and nothing address shaped.
    expect(route).not.toMatch(/p_(client_)?ip|p_address/i);
  });
});

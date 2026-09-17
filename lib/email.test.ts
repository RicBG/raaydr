import { describe, expect, it } from "vitest";
import { looksLikeEmail } from "./email";

/*
 * The cases that matter are the refusals, and the first of them is the one that got
 * through: Ric typed a trailing dot into his own test on 17 September and the form stored
 * it. Board row 1046.
 *
 * The acceptances are here to stop the fix overshooting. Every one of them is an address
 * a real person might have, and a stricter pattern that refuses any of them would cost a
 * real applicant, which is worse than the bug it was written to fix.
 */
describe("looksLikeEmail", () => {
  it("refuses a trailing dot, which is the one that reached production", () => {
    expect(looksLikeEmail("ric+reject@wearebeyondgreatness.co.uk.")).toBe(false);
  });

  it("refuses the other ways a dot goes wrong", () => {
    expect(looksLikeEmail("someone@.example.com")).toBe(false);
    expect(looksLikeEmail("someone@example..com")).toBe(false);
    expect(looksLikeEmail("someone@example")).toBe(false);
  });

  it("refuses the obvious nonsense", () => {
    expect(looksLikeEmail("")).toBe(false);
    expect(looksLikeEmail("someone")).toBe(false);
    expect(looksLikeEmail("@example.com")).toBe(false);
    expect(looksLikeEmail("someone@")).toBe(false);
    expect(looksLikeEmail("some one@example.com")).toBe(false);
    expect(looksLikeEmail("someone@example.c")).toBe(false);
    expect(looksLikeEmail("someone@example.123")).toBe(false);
  });

  it("accepts the addresses real people actually have", () => {
    expect(looksLikeEmail("ricardo@wearebeyondgreatness.co.uk")).toBe(true);
    expect(looksLikeEmail("ric+reject@wearebeyondgreatness.co.uk")).toBe(true);
    expect(looksLikeEmail("first.last@gmail.com")).toBe(true);
    expect(looksLikeEmail("a@b.io")).toBe(true);
    expect(looksLikeEmail("someone@sub.domain.example.com")).toBe(true);
    expect(looksLikeEmail("someone@my-label.com")).toBe(true);
    expect(looksLikeEmail("someone@example.photography")).toBe(true);
  });
});

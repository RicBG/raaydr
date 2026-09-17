import { describe, expect, it } from "vitest";
import { MINIMUM_FILL_MS, looksAutomated } from "./botCheck";

describe("looksAutomated", () => {
  it("passes an ordinary submission", () => {
    expect(looksAutomated({ honeypot: "", elapsedMs: 12_000 })).toBe(false);
  });

  it("catches a filled honeypot however fast or slow the submit", () => {
    expect(looksAutomated({ honeypot: "Acme Ltd", elapsedMs: 90_000 })).toBe(true);
    expect(looksAutomated({ honeypot: "  x  ", elapsedMs: 90_000 })).toBe(true);
  });

  it("catches a submission faster than a person can fill the form", () => {
    expect(looksAutomated({ honeypot: "", elapsedMs: 0 })).toBe(true);
    expect(looksAutomated({ honeypot: "", elapsedMs: MINIMUM_FILL_MS - 1 })).toBe(true);
  });

  it("lets the threshold itself through, because the cost of a false positive is a lost artist", () => {
    expect(looksAutomated({ honeypot: "", elapsedMs: MINIMUM_FILL_MS })).toBe(false);
  });

  it("does not treat a clock that went backwards as a bot", () => {
    expect(looksAutomated({ honeypot: "", elapsedMs: -5000 })).toBe(false);
  });
});

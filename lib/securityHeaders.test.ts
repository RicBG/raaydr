import { describe, expect, it } from "vitest";
import nextConfig, { securityHeaders } from "../next.config";

/*
 * The four headers raaydr.com sends on every response (board rows 6606, 6610,
 * 6618). Raph proved the sister app could be framed; this site sent none of
 * them. The test reads the real config so a later edit that drops one fails
 * here rather than being found by the next sweep.
 */

const value = (key: string) => securityHeaders.find((h) => h.key === key)?.value;

describe("the security headers", () => {
  it("bans framing twice, because one of the two is for older browsers", () => {
    expect(value("X-Frame-Options")).toBe("DENY");
    expect(value("Content-Security-Policy")).toBe("frame-ancestors 'none'");
  });

  it("stops a browser guessing a file's type, and trims the referrer cross-origin", () => {
    expect(value("X-Content-Type-Options")).toBe("nosniff");
    expect(value("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("is not a full Content-Security-Policy, which row 6610 ruled out", () => {
    expect(value("Content-Security-Policy")).not.toMatch(/script-src|default-src|style-src/);
  });

  it("is sent for every path, not for the home page alone", async () => {
    const rules = await nextConfig.headers?.();
    expect(rules).toBeDefined();
    expect(rules).toHaveLength(1);
    expect(rules?.[0]?.source).toBe("/:path*");
    expect(rules?.[0]?.headers).toEqual(securityHeaders);
  });

  it("no longer sets the removed viewTransition flag, which Next 16.4 rejects", () => {
    expect(Object.keys(nextConfig.experimental ?? {})).not.toContain("viewTransition");
  });
});

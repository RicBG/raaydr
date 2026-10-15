import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

// Technical win 5 (row 3263): a sitemap stamped with the build time says every
// page changed on every deploy. Dates must be fixed.
describe("sitemap", () => {
  it("gives the same lastModified on every build for the static routes", async () => {
    const first = sitemap();
    await new Promise((r) => setTimeout(r, 15));
    const second = sitemap();
    expect(second.map((e) => e.lastModified)).toEqual(first.map((e) => e.lastModified));
    for (const entry of first) {
      expect(typeof entry.lastModified).toBe("string");
    }
  });

  it("lists the calculator page and every post", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://raaydr.com/tools/streaming-royalty-calculator");
    expect(urls).toContain("https://raaydr.com/pulse/split-sheet-template");
    expect(urls).toContain("https://raaydr.com/pulse/prs-vs-ppl-uk-royalties");
  });
});

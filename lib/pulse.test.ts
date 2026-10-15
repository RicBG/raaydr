import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SHARE_IMAGE,
  getAllSlugs,
  absoluteImageUrl,
  getPost,
  isRemoteImage,
  shareImage,
} from "./pulse";

describe("shareImage", () => {
  it("uses the hero when a post has one", () => {
    expect(shareImage("/pulse/images/x.jpg")).toBe("/pulse/images/x.jpg");
  });

  it("falls back to the site card when a post has none", () => {
    expect(shareImage("")).toBe(DEFAULT_SHARE_IMAGE);
  });
});

describe("absoluteImageUrl", () => {
  it("prefixes our own images with the site origin", () => {
    expect(absoluteImageUrl("/og.png", "https://raaydr.com")).toBe(
      "https://raaydr.com/og.png"
    );
  });

  it("leaves a hotlinked image on its own host", () => {
    const src = "https://images.unsplash.com/photo-1?w=2048";
    expect(isRemoteImage(src)).toBe(true);
    expect(absoluteImageUrl(src, "https://raaydr.com")).toBe(src);
  });
});

describe("the 1,000 stream rule post (row 3263)", () => {
  const post = getPost("spotify-1000-stream-rule");

  it("loads with its FAQ and closing note", () => {
    expect(post).toBeTruthy();
    expect(post?.faq.length).toBe(5);
    expect(post?.note).toMatch(/hasn't launched to listeners yet/);
  });

  it("carries the Unsplash hero and its photographer credit (row 3347)", () => {
    expect(post?.heroImage).toMatch(
      /^https:\/\/images\.unsplash\.com\/photo-1610716632424-4d45990bcd48\?/
    );
    expect(post?.heroAlt).toBe(
      "A music producer working late at a computer in a home studio"
    );
    expect(post?.heroCredit).toBe("Rezli");
    expect(post?.heroCreditUrl).toMatch(/^https:\/\/unsplash\.com\/photos\/OhTbOJH4w-w/);
  });

  it("uses no dashes in copy", () => {
    const text = JSON.stringify(post);
    expect(text).not.toMatch(/[–—]/);
  });
});

// Pages 2 to 5 of EVE's plan (row 3263). Each one is a draft that has to meet
// the standing rules before it can be judged on its words: a credited hero
// (row 3347), no dashes, no unresolved tokens, a tracked link to raaydr.com,
// and a FAQ the schema can read.
describe.each([
  ["streaming-royalty-calculator-uk", "Unsplash", "zGn2cg9qBvU"],
  ["split-sheet-template", "Unsplash", "Ez-XMWsYHsE"],
  ["prs-vs-ppl-uk-royalties", "Unsplash", "CF8fATqx6VM"],
  ["how-much-does-apple-music-pay-per-stream-uk", "Unsplash", "2gpfqhEFVZ8"],
])("EVE draft %s", (slug, _host, photoId) => {
  const post = getPost(slug);

  it("loads with a FAQ and a closing note", () => {
    expect(post).toBeTruthy();
    expect(post?.faq.length).toBeGreaterThanOrEqual(5);
    expect(post?.note).toMatch(/hasn't launched to listeners yet|general information/);
  });

  it("carries a credited Unsplash hero", () => {
    expect(post?.heroImage).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
    expect(post?.heroAlt.length).toBeGreaterThan(10);
    expect(post?.heroCredit).toBeTruthy();
    expect(post?.heroCreditUrl).toContain(photoId);
    expect(post?.heroCreditUrl).toContain("utm_source=raaydr");
  });

  it("uses no dashes and leaves no token unresolved", () => {
    const text = JSON.stringify(post);
    expect(text).not.toMatch(/[–—]/);
    expect(text).not.toMatch(/\{\{/);
  });

  it("links to raaydr.com only with UTMs", () => {
    const text = JSON.stringify(post);
    for (const m of text.matchAll(/https:\/\/raaydr\.com[^\s")\\]*/g)) {
      expect(m[0]).toMatch(/utm_source=pulse&utm_medium=blog&utm_campaign=/);
    }
  });
});

describe("worked streaming tokens", () => {
  it("print the same sums the rates imply", () => {
    const post = getPost("streaming-royalty-calculator-uk");
    const table = post?.blocks.find(
      (b) => b.type === "table" && b.headers[0] === "Streams"
    );
    expect(table && table.type === "table" ? table.rows[1] : null).toEqual([
      "10,000",
      "£30",
      "£80",
      "£15",
    ]);
  });
});

// Technical win 1 (row 3263): a results page cuts a title at about 60
// characters, and the old suffix pushed most Pulse titles past 90.
describe("Pulse search titles", () => {
  it("every post has an seoTitle that fits with the brand suffix", () => {
    for (const slug of getAllSlugs()) {
      const post = getPost(slug);
      expect(post?.seoTitle, slug).toBeTruthy();
      expect(`${post?.seoTitle} | RAAYDR`.length, slug).toBeLessThanOrEqual(60);
      expect(post?.seoTitle, slug).not.toMatch(/[–—]/);
    }
  });

  it("the money posts link to the per stream post and a tool or role page", () => {
    const moneyPosts = [
      "where-your-9-99-actually-goes",
      "does-ai-music-affect-streaming-royalties",
      "can-you-buy-spotify-streams",
      "how-many-streams-for-1000-a-month",
      "how-producers-and-songwriters-get-paid",
    ];
    for (const slug of moneyPosts) {
      const raw = fs.readFileSync(`content/pulse/${slug}.md`, "utf8");
      expect(raw, slug).toMatch(/\]\(\/pulse\/how-much-does-spotify-pay-per-stream\)/);
      expect(raw, slug).toMatch(/\]\(\/(artists|producers-songwriters|tools\/streaming-royalty-calculator)/);
    }
  });
});

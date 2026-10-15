import { describe, expect, it } from "vitest";
import {
  DEFAULT_SHARE_IMAGE,
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

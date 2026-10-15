import { describe, expect, it } from "vitest";
import { DEFAULT_SHARE_IMAGE, getPost, shareImage } from "./pulse";

describe("shareImage", () => {
  it("uses the hero when a post has one", () => {
    expect(shareImage("/pulse/images/x.jpg")).toBe("/pulse/images/x.jpg");
  });

  it("falls back to the site card when a post has none", () => {
    expect(shareImage("")).toBe(DEFAULT_SHARE_IMAGE);
  });
});

describe("the 1,000 stream rule post (row 3263)", () => {
  const post = getPost("spotify-1000-stream-rule");

  it("loads with its FAQ and closing note", () => {
    expect(post).toBeTruthy();
    expect(post?.faq.length).toBe(5);
    expect(post?.note).toMatch(/hasn't launched to listeners yet/);
  });

  it("uses no dashes in copy", () => {
    const text = JSON.stringify(post);
    expect(text).not.toMatch(/[–—]/);
  });
});

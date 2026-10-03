import { describe, expect, it } from "vitest";
import { withScheme } from "./musicLink";

// Row 2624: a bare domain was stored without a scheme and routed inside the Control Room.
describe("withScheme", () => {
  it("adds https to a bare domain, which is the bug", () => {
    expect(withScheme("ssunsleeper.bandcamp.com")).toBe("https://ssunsleeper.bandcamp.com");
    expect(withScheme("soundcloud.com/someone/tracks")).toBe("https://soundcloud.com/someone/tracks");
    expect(withScheme("  open.spotify.com/artist/abc  ")).toBe("https://open.spotify.com/artist/abc");
  });

  it("leaves a link that already has a scheme alone", () => {
    expect(withScheme("https://open.spotify.com/artist/abc")).toBe("https://open.spotify.com/artist/abc");
    expect(withScheme("http://example.com")).toBe("http://example.com");
  });

  it("gives a protocol relative link https", () => {
    expect(withScheme("//soundcloud.com/x")).toBe("https://soundcloud.com/x");
  });

  it("returns anything that is not a host exactly as typed, so nobody is dropped over a link", () => {
    for (const same of ["@someone", "my bandcamp", "localhost", "javascript:alert(1)", "mailto:a@b.com", "data:text/html,x", ""]) {
      expect(withScheme(same), same).toBe(same.trim());
    }
  });

  it("does not take a host with a port for a scheme", () => {
    expect(withScheme("example.com:8080/x")).toBe("https://example.com:8080/x");
  });

  it("is idempotent", () => {
    const once = withScheme("band.bandcamp.com");
    expect(withScheme(once)).toBe(once);
  });
});

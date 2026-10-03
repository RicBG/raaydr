import { describe, expect, it } from "vitest";
import { parseInline, parseLegal, readLegal, type LegalSlug } from "./legal";

const SLUGS: LegalSlug[] = ["terms", "website-terms", "privacy", "cookies"];

const text = (slug: LegalSlug) =>
  JSON.stringify(readLegal(slug).blocks).replace(/\\"/g, '"');

describe("legal pages", () => {
  it.each(SLUGS)("%s parses with a title and no dashes in the prose", (slug) => {
    const doc = readLegal(slug);
    expect(doc.title.length).toBeGreaterThan(3);
    expect(doc.blocks.length).toBeGreaterThan(0);
    expect(text(slug)).not.toMatch(/[–—]/);
  });

  it("never mentions a waitlist", () => {
    for (const slug of SLUGS) expect(text(slug).toLowerCase()).not.toContain("waitlist");
  });

  it("carries the 3 October rulings, not the wording they replaced", () => {
    const terms = text("terms");
    expect(terms).toContain("£25");
    expect(terms).toContain("second payout after you start earning");
    expect(terms).toContain("The invite lasts 90 days");
    expect(terms).not.toContain("12 months. If they");
    expect(terms).toContain("never keeps the artists' share");
    expect(text("privacy")).toContain('"show my name"');
  });

  it("keeps internal notes off the public pages", () => {
    const terms = text("terms");
    expect(terms).not.toContain("How we compare");
    expect(terms).not.toContain("Decisions made");
    expect(terms).not.toContain("APPROVED by Ric");
  });

  it("parses tables, lists and inline marks", () => {
    const doc = parseLegal(
      "# T\n\n## A b\n\n| x | y |\n| --- | --- |\n| 1 | **2** |\n\n- one\n- two\n\n1. a\n2. b\n\nSee [p](/privacy).",
    );
    expect(doc.sections).toEqual([{ id: "a-b", text: "A b" }]);
    expect(doc.blocks.map((b) => b.kind)).toEqual(["h2", "table", "ul", "ol", "p"]);
    expect(parseInline("**b** and *i*")[0]).toMatchObject({ kind: "bold" });
  });
});

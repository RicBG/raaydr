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

  it("carries the 21 October Day One rule and never the wording it replaced", () => {
    const terms = text("terms");
    expect(readLegal("terms").blocks.length).toBeGreaterThan(0);
    expect(terms).toContain("for as long as you stay subscribed");
    expect(terms).toContain("tape, number and status are yours for good");
    expect(terms).toContain("you return at £9.99");
    expect(terms).not.toMatch(/yours forever/i);
    expect(terms).not.toMatch(/Day One place and price stay yours/i);
    /* Support can reinstate the price for one person. That is private and is never published. */
    expect(terms).not.toMatch(/reinstat|discretion|win.?back/i);
  });

  /*
   * Nothing internal appears in forward-facing copy: no approver names, approval
   * dates, rulings, board rows, agent names or "decided" notes. Those live in code
   * comments, docs/decisions/ and the board. Ric, 15 October 2026, after an
   * approval note shipped at the top of Terms section 9 and sat on the live page
   * for twelve days. The guard before this one checked terms alone, and only for
   * "APPROVED by Ric" in that exact case, which is exactly why it let that through.
   *
   * Short words are matched whole so "authorise" or "deciding" cannot false fire;
   * phrases are matched as substrings. Everything is compared lowercased.
   */
  const INTERNAL_WORDS = [
    "ruled",
    "ruling",
    "riz",
    "codey",
    "deuce",
    "claude",
    "decided",
    "todo",
    "tbd",
    "internal",
    "interim",
    "founding",
  ];
  const INTERNAL_PHRASES = [
    "approved by",
    "signed off",
    "board row",
    "row 2",
    "ops.handoff",
    "decisions made",
    "how we compare",
    "lawyer",
  ];

  const internalHits = (copy: string): string[] => {
    const lower = copy.toLowerCase();
    return [
      ...INTERNAL_WORDS.filter((w) => new RegExp(`\\b${w}\\b`).test(lower)),
      ...INTERNAL_PHRASES.filter((p) => lower.includes(p)),
    ];
  };

  it.each(SLUGS)("%s carries nothing internal", (slug) => {
    expect(internalHits(text(slug))).toEqual([]);
  });

  it("the guard catches the sentence that shipped", () => {
    expect(
      internalHits(
        "Approved by Ric on 3 October 2026. You agree to this once, before your first clip.",
      ),
    ).toEqual(["approved by"]);
    expect(internalHits("There are 25 founding places.")).toEqual(["founding"]);
    expect(internalHits("You authorise us to decide, and we are deciding.")).toEqual([]);
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

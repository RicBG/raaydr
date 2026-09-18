import { describe, expect, it } from "vitest";
import { looksLikeEmail, normaliseEmail } from "./email";

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

/*
 * ============================================================================
 * THE `mailto:` PREFIX, FOUND ON PRODUCTION RATHER THAN IMAGINED
 * ============================================================================
 *
 * 18 September 2026, the first real use of the acknowledgement endpoint. Ric
 * signed up with `mailto:ricardo+acktest1@wearebeyondgreatness.co.uk`, which
 * is what a phone hands you when you copy an address out of a contact card.
 *
 * Every guard took it. The row stored, the signup succeeded, and Resend
 * refused the send with `Invalid to field`. The acknowledgement was lost and
 * the only evidence was a log line.
 */
describe("a pasted mailto: link", () => {
  const PASTED = "mailto:ricardo+acktest1@wearebeyondgreatness.co.uk";
  const MEANT = "ricardo+acktest1@wearebeyondgreatness.co.uk";

  /*
   * THE ASSERTION THAT EXPLAINS THE BUG, and it is deliberately the "wrong"
   * way round: the pattern ACCEPTS the prefix, and that is why nothing caught
   * it. `EMAIL_PATTERN`'s local part is `[^\s@]+`, and `mailto:ricardo+...`
   * has no space and no @, so it is a valid local part as far as it knows.
   *
   * Pinned rather than fixed by tightening the pattern, because refusing it is
   * the wrong fix: the person typed the right address and their phone
   * decorated it, so an error about an address that is correct is a signup
   * lost to a machine's helpfulness.
   */
  it("still passes the pattern, which is why it reached Resend", () => {
    expect(looksLikeEmail(PASTED)).toBe(true);
  });

  it("is stripped back to what the person meant", () => {
    expect(normaliseEmail(PASTED)).toBe(MEANT);
    expect(looksLikeEmail(normaliseEmail(PASTED))).toBe(true);
  });

  it("handles the casing and the whitespace a paste brings with it", () => {
    expect(normaliseEmail("  MAILTO:ric@raaydr.com  ")).toBe("ric@raaydr.com");
    expect(normaliseEmail("Mailto: ric@raaydr.com")).toBe("ric@raaydr.com");
  });

  /*
   * ONLY AT THE START, AND ONLY ONCE. A normaliser that rewrites the middle of
   * an address is a normaliser that will one day mangle a real one: `mailto:`
   * is legal inside a local part, however unlikely, and nothing here should be
   * deciding that somebody's address is a mistake.
   */
  it("never rewrites the middle of an address", () => {
    expect(normaliseEmail("mailto:mailto@raaydr.com")).toBe("mailto@raaydr.com");
    expect(normaliseEmail("a.mailto:b@raaydr.com")).toBe("a.mailto:b@raaydr.com");
    expect(normaliseEmail("ric@raaydr.com")).toBe("ric@raaydr.com");
  });

  /* An empty or absent value stays empty rather than becoming something. */
  it("leaves nothing as nothing", () => {
    expect(normaliseEmail("")).toBe("");
    expect(normaliseEmail("   ")).toBe("");
    expect(normaliseEmail("mailto:")).toBe("");
  });
});

/*
 * ============================================================================
 * THE TRAILING DOT, WHICH THIS FILE ALREADY HAS A SECTION ABOUT
 * ============================================================================
 *
 * Board row 1046 tightened `EMAIL_PATTERN` so `ric+reject@wearebeyondgreatness.co.uk.`
 * would be refused. Board row 1161 found the row it was refused over still sitting in
 * `waitlist_signups`, stored the afternoon before, and due to be mailed by the backfill.
 *
 * The pattern has not changed and these first two assertions pin that. What changed is
 * that the dot never reaches it.
 */
describe("a trailing dot", () => {
  const TYPED = "ric+reject@wearebeyondgreatness.co.uk.";
  const MEANT = "ric+reject@wearebeyondgreatness.co.uk";

  it("is still refused by the pattern, which is row 1046 holding", () => {
    expect(looksLikeEmail(TYPED)).toBe(false);
  });

  it("comes off before the pattern is asked, so the signup survives", () => {
    expect(normaliseEmail(TYPED)).toBe(MEANT);
    expect(looksLikeEmail(normaliseEmail(TYPED))).toBe(true);
  });

  /* The shape a paste leaves: a space after the dot, or a dot after the space. */
  it("comes off through the whitespace that hid it", () => {
    expect(normaliseEmail("a@b.com . ")).toBe("a@b.com");
    expect(normaliseEmail("  a@b.com.  ")).toBe("a@b.com");
    expect(normaliseEmail("mailto:a@b.com.")).toBe("a@b.com");
  });

  /* A dot INSIDE an address is ordinary and must survive untouched. */
  it("leaves every other dot alone", () => {
    expect(normaliseEmail("first.last@mail.example.co.uk")).toBe(
      "first.last@mail.example.co.uk",
    );
  });

  /*
   * NOTHING ELSE BECAME ACCEPTABLE. The strip is one character class at the end of the
   * string, so every other shape row 1046 ruled out is still ruled out after it runs.
   */
  it("does not quietly widen what the form accepts", () => {
    for (const bad of ["a@b", "a@b.c", "a@b.123", "a@.b.com", "a@b..com", "a b@c.com"]) {
      expect(looksLikeEmail(normaliseEmail(bad)), bad).toBe(false);
    }
  });
});

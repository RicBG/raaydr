import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PLATFORM_ROLE, SECRET_HEADER } from "./signupAcknowledgement";
import { WAITLIST_ROLE_SLUGS } from "./waitlistRoles";

/*
 * ===========================================================================
 * THE TWO NAMES FOR ONE AUDIENCE
 * ===========================================================================
 *
 * This site stores `songwriter_producer`. The platform's `user_roles` has only
 * ever had `producer_songwriter`. The same two words, in the opposite order.
 *
 * It is the kind of difference that survives every review, because both look
 * right in the file you happen to be reading, and then fails at runtime as a
 * 400 the visitor never sees: their signup saved, their acknowledgement did
 * not, and nothing on this side would say so.
 *
 * Proved rather than argued: the endpoint refused `songwriter_producer` with a
 * 400 when it was sent unmapped during the run on 18 September.
 */
describe("the role a signup is acknowledged under", () => {
  it("translates every slug this site can store", () => {
    for (const slug of WAITLIST_ROLE_SLUGS) {
      expect(PLATFORM_ROLE[slug]).toBeTruthy();
    }
  });

  it("knows the two words are the other way round on the platform", () => {
    expect(PLATFORM_ROLE.songwriter_producer).toBe("producer_songwriter");
  });

  /*
   * The three that happen to match are still translated rather than passed
   * through, so there is one place to look when a fifth audience is added and
   * one place for it to be missing from.
   */
  it("passes the three that do match through unchanged", () => {
    expect(PLATFORM_ROLE.listener).toBe("listener");
    expect(PLATFORM_ROLE.artist).toBe("artist");
    expect(PLATFORM_ROLE.tastemaker).toBe("tastemaker");
  });

  it("maps nothing to a role the platform does not have", () => {
    const platformRoles = ["listener", "artist", "producer_songwriter", "tastemaker"];
    for (const slug of WAITLIST_ROLE_SLUGS) {
      expect(platformRoles).toContain(PLATFORM_ROLE[slug]);
    }
  });
});

/*
 * ===========================================================================
 * A SIGNUP MUST NEVER FAIL BECAUSE AN EMAIL DID
 * ===========================================================================
 *
 * Ruled on board row 1127. The row is written before this call runs, so the
 * person has joined whatever happens next; a platform that is slow, down or
 * missing the secret costs a log line rather than a conversion.
 *
 * Read from the source rather than exercised, because what has to be true is
 * the SHAPE: no throw path out of the function at all. A test that called it
 * and saw it resolve would pass just as happily with a `throw` inside a branch
 * it did not take.
 */
describe("the call cannot break a signup", () => {
  const SOURCE = readFileSync(
    join(import.meta.dirname, "signupAcknowledgement.ts"),
    "utf8"
  );

  it("wraps the fetch and swallows every failure", () => {
    expect(SOURCE).toContain("try {");
    expect(SOURCE).toContain("} catch (error) {");
    /* Nothing in here rethrows, so the caller has nothing to handle. */
    expect(SOURCE).not.toMatch(/^\s*throw /m);
  });

  it("returns rather than throwing when it is not configured at all", () => {
    expect(SOURCE).toContain("if (!config) {");
    expect(SOURCE).toContain("return;");
  });

  /*
   * The secret goes in a header and nowhere else. Not a query string, which
   * lands in access logs and in a Referer; not a body field, which ends up in
   * request dumps. And never in a log line on either side.
   */
  it("carries the secret in a header and never writes it down", () => {
    expect(SECRET_HEADER).toBe("x-raaydr-signup-secret");
    expect(SOURCE).toContain("[SECRET_HEADER]: config.secret");
    /*
     * THE VALUE, NOT THE NAME, and the difference cost two versions of this
     * assertion. "SIGNUP_NOTIFY_SECRET not set" is a log line worth having, so
     * a regex for the word `secret` banned the right behaviour. A regex for
     * `config.secret` within a few hundred characters of a `console.` then
     * matched across the end of the call and into the fetch headers below it.
     *
     * Both were guards written by pattern rather than by what they guard, so
     * this reads the ARGUMENTS of each console call and nothing else.
     */
    for (const args of consoleArguments(SOURCE)) {
      expect(args).not.toContain("config.secret");
      expect(args).not.toMatch(/\$\{\s*secret/);
    }
    expect(SOURCE).not.toMatch(/\?[^"`]*secret=/);
  });
});

/**
 * The text inside each `console.something(...)` call, by balancing brackets.
 *
 * Written rather than reached for, because the alternative is a regex that
 * either stops at the first `)` inside a template literal or runs past the
 * last one into whatever follows. Both have already happened here.
 */
function consoleArguments(source: string): string[] {
  const calls: string[] = [];
  const opener = /console\.\w+\(/g;
  let match: RegExpExecArray | null;
  while ((match = opener.exec(source))) {
    let depth = 1;
    let i = match.index + match[0].length;
    const from = i;
    while (i < source.length && depth > 0) {
      if (source[i] === "(") depth += 1;
      if (source[i] === ")") depth -= 1;
      i += 1;
    }
    calls.push(source.slice(from, i - 1));
  }
  return calls;
}

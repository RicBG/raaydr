/*
 * ONE DEFINITION OF WHAT AN EMAIL ADDRESS LOOKS LIKE, FOR BOTH SIDES.
 *
 * The waitlist route and the capture form each have to refuse a bad address, and until
 * 17 September 2026 each carried its own copy of this pattern. A constant that mirrors
 * another constant drifts, and a comment saying "change this too" is not a mechanism, so
 * it lives here and both import it, which is one.
 *
 * ============================================================================
 * IT WAS TOO LOOSE, AND RIC'S OWN TEST DATA IS THE PROOF
 * ============================================================================
 *
 * Board row 1046. Testing the reject path on 17 September he typed:
 *
 *     ric+reject@wearebeyondgreatness.co.uk.
 *
 * with a trailing dot, and the form took it. The old pattern asked for something before
 * an @, something after it, and a dot with two more characters, and a trailing dot
 * satisfies all three: `co.uk.` reads as "domain `co.uk`, then a dot, then `.`" to a
 * regex that never says what a label may contain.
 *
 * WHY IT MATTERS MORE HERE THAN ON MOST FORMS. An applicant who types `gmail.com.` sees
 * the thank-you, lands in Ric's queue looking exactly like everybody else, gets approved,
 * and the invite bounces. He is left believing he let somebody in. That is the same
 * failure as the two silent drops this form has already had: a person believes something
 * happened that did not, and nothing on our side says otherwise.
 *
 * ============================================================================
 * STILL DELIBERATELY LOOSE, AND THAT HAS NOT CHANGED
 * ============================================================================
 *
 * This does not try to implement RFC 5322, which admits addresses nobody has, and it does
 * not check whether the domain exists, which needs a network. It asserts the shape a human
 * typo actually breaks:
 *
 *   - a local part, then exactly one @, then a domain
 *   - the domain is dot-separated labels, at least two of them
 *   - no label is empty, which is what rules out a leading dot, a trailing dot and `..`
 *   - the last label is at least two characters and is letters, so `.c` and `.123` go
 *
 * Everything else a person might type and mean is still accepted, including plus
 * addressing, dots in the local part, hyphens, and long new top level domains.
 *
 * An address is still only really checked by sending to it, which for an applicant is
 * exactly what approving them does. This narrows the gap between "we accepted it" and
 * "we could reach them"; it does not close it, and nothing here can.
 */

/** A domain label: letters, digits and hyphens, never empty, never starting a dot run. */
const LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?';

export const EMAIL_PATTERN = new RegExp(
  `^[^\\s@]+@(?:${LABEL}\\.)+[A-Za-z]{2,}$`,
);

/** True where `value` is plausibly an address we could write to. */
export function looksLikeEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

/*
 * ============================================================================
 * A PASTED ADDRESS CAN ARRIVE AS A `mailto:` LINK, AND EVERY CHECK ABOVE TAKES IT
 * ============================================================================
 *
 * Found on production, 18 September 2026, on the first real use of the
 * acknowledgement endpoint. Ric signed up with:
 *
 *     mailto:ricardo+acktest1@wearebeyondgreatness.co.uk
 *
 * which is what a phone gives you when you copy an address out of a contact
 * card or a link rather than out of a text field.
 *
 * **Every guard we had accepted it.** `EMAIL_PATTERN`'s local part is
 * `[^\s@]+`, and `mailto:ricardo+acktest1` has no space and no @, so it is a
 * perfectly good local part as far as that regex is concerned. The platform
 * endpoint's own check is `includes("@")`, which it also passes. The row
 * stored, the signup succeeded, and **Resend refused the send**: `Invalid to
 * field`. The acknowledgement was lost and the only evidence was a log line.
 *
 * The same prefix is already sitting in `invites` on the platform, which is
 * the same paste arriving through the artist application. That one is Ric's
 * test address so nothing has gone to a broken address yet; if it happens to a
 * real artist they are invited at an address nothing else will match.
 *
 * ============================================================================
 * IT IS STRIPPED RATHER THAN REFUSED, AND THAT IS THE POINT
 * ============================================================================
 *
 * Tightening `EMAIL_PATTERN` to reject a colon would be one character and the
 * wrong fix: the person typed the right address, their phone decorated it, and
 * an error telling them to check an address that is correct is a signup lost
 * to a machine's helpfulness. We know exactly what they meant.
 *
 * ONLY `mailto:`, and only at the start. `<ric@raaydr.com>` is the other thing
 * an email client will hand you and it would fail the same way; it is not
 * handled here because it has not happened, and inventing the shape of a
 * problem nobody has had is how a normaliser starts rewriting real addresses.
 * If it turns up, it belongs here beside this one.
 */
/*
 * ============================================================================
 * AND A TRAILING DOT IS STRIPPED NOW RATHER THAN REFUSED. Board row 1161.
 * ============================================================================
 *
 * This file already has a long section on `ric+reject@wearebeyondgreatness.co.uk.`,
 * because that address is why `EMAIL_PATTERN` was tightened on 17 September. What row
 * 1161 found is that the row is still sitting in `waitlist_signups`, stored on the
 * afternoon before the fix, and that the backfill would have mailed it.
 *
 * **Refusing it was the right answer to the wrong half of the question.** A pattern that
 * takes `co.uk.` is broken and had to be fixed either way; the pattern is unchanged and
 * still runs, below, on whatever comes out of here. But refusing the SUBMISSION means a
 * person who typed their address correctly, and whose keyboard or paste added a dot, is
 * told their address is wrong. They will read it, see it is right, and try again.
 *
 * We know what they meant, exactly as we do with `mailto:`, and the same argument
 * applies: a signup lost to punctuation is a signup lost. So the dot comes off, and then
 * the pattern decides. Nothing that was refused before is accepted now except this one
 * character, and nothing that was stored before is rewritten.
 *
 * Trailing whitespace goes with it, and the order matters: `"a@b.com . "` has to lose
 * the space, then the dot, then the space again, which is why it is one character class
 * repeated rather than two separate strips.
 */
export function normaliseEmail(value: string): string {
  return value
    .trim()
    .replace(/^mailto:/i, "")
    .replace(/[\s.]+$/, "")
    .trim();
}

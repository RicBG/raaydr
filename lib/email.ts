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

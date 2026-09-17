/*
 * ONE DEFINITION OF WHAT AN EMAIL ADDRESS LOOKS LIKE, FOR BOTH SIDES.
 *
 * The waitlist route and the capture form each have to refuse a bad address,
 * and until 17 September 2026 each carried its own copy of this pattern. A
 * constant that mirrors another constant drifts, and a comment saying "change
 * this too" is not a mechanism — so it lives here and both import it, which
 * is one.
 *
 * It is deliberately loose: something before an @, something after it, and a
 * dot with at least two more characters. Anything stricter starts refusing
 * addresses that work, and an address is only really checked by sending to
 * it — which, for an applicant, is exactly what approving them does.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** True where `value` is plausibly an address we could write to. */
export function looksLikeEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

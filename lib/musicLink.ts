/*
 * The music link on the artist application, stored WITH a scheme.
 *
 * Board row 2624 (Ric, 3 October). An applicant typed `ssunsleeper.bandcamp.com` and it was stored
 * exactly like that. The Control Room rendered it as an `href`, which a browser resolves as a path
 * relative to the page it is on, so Listen routed inside the admin screens instead of out to the
 * music. The platform now refuses to put anything but http(s) in an href (`listenHref`), so this
 * is the other end of the same fix: new rows are stored with the scheme, and existing rows are
 * covered by the render helper.
 *
 * WHAT THIS DOES AND DELIBERATELY DOES NOT DO
 *
 *   - A value that looks like a host (a dot, no spaces, no scheme) gets `https://`.
 *   - `//host/path` gets `https:`.
 *   - EVERYTHING ELSE IS RETURNED AS TYPED. A handle like `@someone`, a sentence, `javascript:...`:
 *     not touched and not refused. The form's job is to not lose an applicant over how they wrote
 *     a link (a dropped application is the one defect class that stops a merge here), and the
 *     platform's render helper is what decides whether a stored value is ever a link.
 *   - It never throws and never makes a value longer than it was by more than the scheme.
 */
export function withScheme(value: string): string {
  const v = value.trim();
  if (v === "") return v;
  if (/\s/.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return v;
  if (v.startsWith("//")) return `https:${v}`;
  // A scheme with no slashes (javascript:, mailto:, data:) that is not a host:port. Left as typed.
  if (/^[a-z][a-z0-9+.-]*:(?!\d+(?:[/?#]|$))/i.test(v)) return v;
  // Needs to look like a host: a dot inside it, before any path.
  const host = v.split(/[/?#]/, 1)[0] ?? "";
  if (!host.includes(".") || host.startsWith(".") || host.endsWith(".")) return v;
  return `https://${v}`;
}

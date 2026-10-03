/*
 * WHERE A SIGN-UP CAME FROM, AS A TWO LETTER CODE AND NOTHING ELSE.
 *
 * Ric, 3 October 2026, board rows 2566 and 2603: anyone can sign up from anywhere, and the
 * country they sign up from is the signal to go and license that country. So the site stores
 * the country, once, on the row.
 *
 * THE CODE, NEVER THE ADDRESS. The only thing read here is Vercel's `x-vercel-ip-country`,
 * which is a country already resolved at the edge. The IP address is not read, not logged and
 * not passed on, and there is deliberately nowhere in this file that could hold one. The
 * privacy policy line for this is Riz's to draft and Ric's to rule, after #84 merges.
 *
 * WHY THIS HEADER AND NO FALLBACK CHAIN. The platform's rule for the client's address is that
 * only a header the edge sets, and refuses to accept from a client, may be trusted, and that an
 * absent one is recorded as absent rather than guessed (CLAUDE.md in `raaydr-platform`, the
 * `cf-connecting-ip` bullet, board row 995). On a Vercel hosted site the equivalent is this
 * header, which Vercel overwrites. The forgery test is `claude-chat`'s to run against the live
 * site, row 2603; until it has been run this is a documented assumption, not a proven one.
 *
 * Absent, malformed or anything but two capital letters is `null`, which the column stores as
 * "unknown". A guessed country is a row that lies.
 */

/** The header Vercel sets from the connection, ISO 3166-1 alpha-2. */
export const COUNTRY_HEADER = "x-vercel-ip-country";

export function countryFromHeaders(headers: Headers): string | null {
  const raw = headers.get(COUNTRY_HEADER);
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

// Where a visitor came from, captured once per session.
//
// Read on first page load and kept in sessionStorage so it survives internal
// navigation. The journey this exists for is: Instagram bio link lands on the
// homepage, visitor reads, navigates, submits the form somewhere else entirely.
// Without this the row records only where the form was, never what brought
// them to it.
//
// Deliberately session scoped. Someone who lands from the bio link today and
// signs up next week from a bookmark records as direct, and that is accepted:
// cross session attribution needs a first party cookie and is not worth it at
// this volume.

const KEY = "raaydr_attr";

/** The five UTM keys, in the order they are written to the row. */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/** Lowercased on capture. Source and medium are a controlled vocabulary, so
 *  "Instagram" and "instagram" must not become two rows in a report. Campaign,
 *  content and term are free text and keep their case. */
const LOWERCASED = new Set<string>(["utm_source", "utm_medium"]);

export type Attribution = Partial<
  Record<(typeof UTM_KEYS)[number] | "referrer" | "landing_path", string>
>;

/**
 * Trim a captured value to something safe to persist.
 *
 * Never store a raw query string. These end up in a reporting table that gets
 * read by humans and joined against GA4, and third party tracking parameters
 * carry junk and occasionally session tokens.
 */
function clean(value: string, key: string): string | undefined {
  const stripped = value
    .replace(/[^A-Za-z0-9._~%+ -]/g, "")
    .trim()
    .slice(0, 200);
  if (!stripped) return undefined;
  return LOWERCASED.has(key) ? stripped.toLowerCase() : stripped;
}

/** Origin plus pathname only. A referrer's own query string and fragment can
 *  carry another site's tracking parameters, which are not ours to keep. */
function cleanReferrer(raw: string): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`.slice(0, 200);
  } catch {
    return undefined;
  }
}

/**
 * Capture attribution for this session, if it has not been captured already.
 *
 * FIRST TOUCH WINS. If the key exists, it is left exactly as it is. That is the
 * whole point: the entry point is what has value, and every subsequent page
 * view would otherwise overwrite it with a less informative one.
 *
 * Safe to call on every page load, and cheap. Never throws: a visitor with
 * sessionStorage disabled or full still gets to sign up, they just arrive
 * unattributed.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const attr: Attribution = {};

    for (const key of UTM_KEYS) {
      const raw = params.get(key);
      if (!raw) continue;
      const value = clean(raw, key);
      if (value) attr[key] = value;
    }

    // Stored even with no UTMs present. Untagged Instagram profile traffic is
    // the majority case, and the referrer is the only thing separating it from
    // direct and from search.
    const referrer = cleanReferrer(document.referrer);
    if (referrer) attr.referrer = referrer;
    attr.landing_path = window.location.pathname.slice(0, 200);

    window.sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    // sessionStorage unavailable (private mode, quota, blocked). Not a reason
    // to break a page load.
  }
}

/** Read this session's attribution. Returns an empty object rather than
 *  throwing, so a caller can always spread it into a payload. */
export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Attribution;
  } catch {
    return {};
  }
}

// Waitlist genre options. Safe to import from both client and server code — it
// contains no secrets.
//
// POINT-IN-TIME COPY of the platform's top-level genre list, taken on
// 24 August 2026 from RicBG/raaydr-platform, packages/rates/src/raaydr-rates.ts
// (the GENRE_TAXONOMY export that the upload flow's genre selector renders).
// Fourteen genres, copied in the platform's own display order. Subgenres are
// deliberately not copied: this is one question on a waitlist form, not the
// upload flow.
//
// The two repos share no package, so this WILL drift as the platform's taxonomy
// changes, and nothing here will notice. That is accepted. A waitlist genre is
// a marketing signal about who is showing up, not an authoritative record of
// what anyone releases; the platform's own list stays the authority for tracks.
//
// The stored values are the platform's stable ids (slugs), not the labels, so a
// signup and that artist's later uploads line up without hand reconciliation.
// Production already holds `rnb-soul` on live track rows, which is what
// confirms the id form is what travels.

/** A genre option: `code` is stored, `label` is shown. */
export type WaitlistGenre = { code: string; label: string };

/**
 * The fourteen platform genres, in the platform's order, plus `other` last.
 *
 * `other` exists only here — the platform has no such genre. It is a deliberate
 * escape hatch with no follow-up field: the people who pick it get asked
 * directly what they make, and their answers are the evidence for what the
 * platform's list is missing.
 */
export const WAITLIST_GENRES = [
  { code: "rap-hip-hop", label: "Rap & Hip Hop" },
  { code: "rnb-soul", label: "R&B & Soul" },
  { code: "afrobeats-amapiano", label: "Afrobeats & Amapiano" },
  { code: "dancehall-reggae", label: "Dancehall & Reggae" },
  { code: "electronic", label: "Electronic" },
  { code: "pop", label: "Pop" },
  { code: "rock-alternative", label: "Rock & Alternative" },
  { code: "country-americana", label: "Country & Americana" },
  { code: "jazz-blues", label: "Jazz & Blues" },
  { code: "gospel-inspirational", label: "Gospel & Inspirational" },
  { code: "latin", label: "Latin" },
  { code: "folk-acoustic", label: "Folk & Acoustic" },
  { code: "instrumental-score", label: "Instrumental & Score" },
  { code: "spoken-word", label: "Spoken Word & Poetry" },
  { code: "other", label: "Other" },
] as const satisfies readonly WaitlistGenre[];

export type WaitlistGenreCode = (typeof WAITLIST_GENRES)[number]["code"];

/** Runtime guard usable with a plain string (e.g. request body). */
export function isWaitlistGenreCode(value: string): value is WaitlistGenreCode {
  return WAITLIST_GENRES.some((g) => g.code === value);
}

/**
 * Longest artist/band name the form and the API accept.
 *
 * Long enough for a real band name with an "and the" in it, short enough that
 * the column never has to hold an essay pasted into the wrong field.
 */
export const ARTIST_NAME_MAX_LENGTH = 120;

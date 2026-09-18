/*
 * HOW LONG A NAME MAY BE, IN ONE PLACE.
 *
 * Ruled by Ric on 18 September 2026 (board rows 1093 and 1103): every audience
 * is asked its name, not only artists. The form caps what can be typed and the
 * API route caps what it stores, and those are two enforcement points of one
 * decision — so the number lives here and both import it, the same arrangement
 * and for the same reason as `lib/email`. A constant that mirrors a constant
 * drifts; a comment saying "change this too" is not a mechanism.
 *
 * 120 matches `ARTIST_NAME_MAX_LENGTH`, which is not a coincidence worth
 * hiding: they are separate facts about separate fields that happen to want the
 * same ceiling, so they are separate constants rather than one shared one. If
 * somebody ever needs a longer artist name than a person's name, nothing here
 * has to move.
 *
 * The column itself is plain `text` with no length constraint, deliberately.
 * The cap exists so a paste of a whole paragraph cannot become a row nobody can
 * read in the admin list, not as a rule about what a name is: plenty of real
 * names are longer than a form designer expects, and none of them are 120
 * characters.
 */

/** The longest name the form accepts and the route stores. */
export const NAME_MAX_LENGTH = 120;

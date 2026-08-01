// The one-line offer shown under the role selector on the homepage waitlist
// forms. It changes with the role the visitor picks.
//
// Source of truth: raaydr-economics-locked.md v1.3 §1 (Google Drive), which
// sets the listener price ladder and the Day One creator cohorts at 100
// artists, 100 producers/songwriters and 25 tastemakers, all receiving RAAYDR+
// free forever. Every number below is interpolated from raaydrRates so the
// copy cannot drift from the rates the rest of the site reads.
//
// Copy rules: plain, UK spelling, no em dashes or en dashes, one short line.

import { FOUNDING_COHORTS, PRICING } from "./raaydrRates";
import type { WaitlistRoleLabel } from "./waitlistRoles";

/**
 * Listener line, and the default shown before a role is chosen.
 *
 * The default is deliberately the listener offer rather than something neutral:
 * most visitors are listeners, and an empty slot that fills in on selection
 * reads as a layout jump.
 */
export const DEFAULT_OFFER = `The first ${PRICING.dayOneFirstBand} lock £${PRICING.dayOne} a month forever, the next ${PRICING.dayOneCap - PRICING.dayOneFirstBand} lock £${PRICING.dayOneNext}.`;

export const ROLE_OFFER: Record<WaitlistRoleLabel, string> = {
  Listener: DEFAULT_OFFER,
  Artist: `The first ${FOUNDING_COHORTS.artists} artists get RAAYDR+ free forever.`,
  "Songwriter or Producer": `The first ${FOUNDING_COHORTS.producersAndSongwriters} producers and songwriters get RAAYDR+ free forever.`,
  Tastemaker: `The first ${FOUNDING_COHORTS.tastemakers} tastemakers get RAAYDR+ free forever.`,
};

/** The offer line for the currently selected role, or the default if none. */
export function offerFor(role: WaitlistRoleLabel | null): string {
  return role ? ROLE_OFFER[role] : DEFAULT_OFFER;
}

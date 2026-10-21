// What a Day One listener's price and place mean once they have lapsed, written once.
//
// RULED 21 OCTOBER 2026, board rows 3657 and 3658. The earlier ruling (24 September, rows 1469
// and 1470) said the £6.99 was locked forever, even after cancelling and coming back. Ric
// replaced it: £6.99 holds for as long as the subscription is active, a lapsed Day One who
// returns pays the standard price, and the PLACE, the number and the tape are never released.
// Only the price follows the subscription; the place does not.
//
// Every public sentence about this reads from here, so the homepage, /about, the listener FAQ,
// the FAQ schema, the waitlist offer line and llms.txt cannot disagree about it. The price is
// read from the rates file, never typed. `lib/dayOneTerms.test.ts` also fails if the retired
// wording comes back in any page that publishes it.
//
// WHAT THIS DELIBERATELY DOES NOT SAY. Support can reinstate £6.99 for one person at RAAYDR's
// discretion. That is internal and is never published, so there is no sentence for it here and
// there must not be one on the site.

import { PRICING } from "./raaydrRates";

const PRICE = `£${PRICING.dayOne}`;

export const DAY_ONE_TERMS = {
  /** For copy addressed to the reader: the homepage, About, the FAQ answers. */
  you: `${PRICE} a month for as long as you stay subscribed, and your Day One tape and number are yours for good`,
  /** For copy about the cohort: the waitlist offer, Pulse posts, llms.txt. */
  they: `${PRICE} a month for as long as they stay subscribed, and their Day One tape and number are theirs for good`,
} as const;

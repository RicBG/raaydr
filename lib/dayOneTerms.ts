// What a Day One listener's price and place mean, written once.
//
// RULED 29 OCTOBER 2026, platform board rows 4354, 4355 and 4358, REVERSING the 21 October ruling
// (rows 3657 and 3658) and restoring the 24 September one (rows 1469 and 1470). Ric: "if you get
// the day one price then you pay the day one price forever", and "anything that we say, we
// honour". So the £6.99 is kept for good, including if the listener cancels and comes back, and the
// place, the number and the tape are theirs too. The price path never changed (it has no lapse
// logic, row 4363), so this was only ever copy.
//
// Every public sentence about this reads from here, so the homepage, /about, the listener FAQ,
// the FAQ schema, the waitlist offer line and llms.txt cannot disagree about it. The price is
// read from the rates file, never typed. `lib/dayOneTerms.test.ts` also fails if the retired
// 21 October wording ("for as long as you stay subscribed", "you return at £9.99") comes back in
// any page that publishes it.
//
// WHAT THIS DELIBERATELY DOES NOT SAY. Support can reinstate £6.99 for one person at RAAYDR's
// discretion. That is internal and is never published, so there is no sentence for it here and
// there must not be one on the site.

import { PRICING } from "./raaydrRates";

const PRICE = `£${PRICING.dayOne}`;

export const DAY_ONE_TERMS = {
  /** For copy addressed to the reader: the homepage, About, the FAQ answers. */
  you: `${PRICE} a month for good, and your Day One tape and number are yours too`,
  /** For copy about the cohort: the waitlist offer, Pulse posts, llms.txt. */
  they: `${PRICE} a month for good, and their Day One tape and number are theirs too`,
} as const;

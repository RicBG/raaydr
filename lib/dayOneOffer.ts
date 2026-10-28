// The two sentences the site can say about the Day One offer, written once.
//
// WHY THIS IS A FILE OF ITS OWN. Every surface that sells a place now has an open wording and a
// closed one, and the waitlist offer line, the home page, About and the listeners page all say
// the same sentence. Four copies of a sentence that has two states is how one of them ends up
// stating the closed state wrongly while the others are right. Board rows 2962 and 2965 (the
// mechanism), 2967 (Ric's go), `work_items` 225.
//
// THE CLOSED WORDING IS PLAIN, NOT WARM. "All {cap} Day One places have gone" is a fact. It
// makes no claim about what being early still earns, because nothing approved says so.
//
// THE PRICE AND THE COHORT SIZE ARE READ FROM THE RATES FILE. Nothing here types a number.

import { DAY_ONE_TERMS } from "./dayOneTerms";
import { PRICING } from "./raaydrRates";

/** Places remain. Reads `DAY_ONE_TERMS`, so it cannot disagree with the FAQ, About or llms.txt. */
export const DAY_ONE_OPEN_LINE = `The first ${PRICING.dayOneCap} listeners get ${DAY_ONE_TERMS.they}. After that, RAAYDR is £${PRICING.standard}.`;

/** Places have gone, or the platform could not be asked. The wording that never sells a place. */
export const DAY_ONE_CLOSED_LINE = `All ${PRICING.dayOneCap} Day One places have gone. RAAYDR is £${PRICING.standard} a month.`;

export function dayOneOfferLine(open: boolean): string {
  return open ? DAY_ONE_OPEN_LINE : DAY_ONE_CLOSED_LINE;
}

# The terms say a Day One price is kept for good, through a cancel and a return

- **Date:** 2026-10-29
- **Decided by:** Ric, 29 October 2026, 16:22 and 16:24 (platform board rows 4354 and 4355). The wording of the three lines is `claude-deuce`'s and is **a draft for Ric to read**, because it is legal text.
- **Related:** platform board rows 4354, 4355, 4358, 4363; supersedes the 21 October ruling (rows 3657, 3658, 3671 item 2) and restores the 24 September ruling (rows 1469, 1470); `2026-09-24-the-site-says-forever-and-means-it.md`
- **Status:** DECIDED (wording awaiting Ric's reading)
- **About:** The terms now say a Day One price is kept for good including after a cancel and a return, replacing the 21 October line that said a return is at £9.99, as version 1.3.

## The decision

Terms version 1.3 (29 October 2026) changes three lines of `content/legal/terms.md` and the version line:

1. **Section 3, the Day One row.** Was: "£6.99 a month for as long as you stay subscribed. Your Day One tape, number and status are yours for good. If you cancel and come back, you return at £9.99." Now: "£6.99 a month, for good. Your Day One price, tape, number and status are yours for good. If you cancel and come back, you come back at £6.99."
2. **Section 3, the sentence under the table.** Was: "While you stay subscribed, a Day One price never goes up." Now: "A Day One price never goes up."
3. **The creators section bullet.** Was: "Your Day One tape, number and status stay yours if you come back, as section 3 says. If you cancel and come back, you return at £9.99 a month." Now: "Your Day One price, tape, number and status stay yours if you come back, as section 3 says."

## Context

On 21 October Ric ruled that a Day One listener who lapses and returns pays the standard price, and the terms (v1.2) and the subscription page were changed to say so. On 29 October at 16:22 he reversed it: "if you get the day one price then you pay the day one price forever", and at 16:24, as a standing rule, "anything that we say, we honour." The price path never changed: `claude-code` read `price_entitlement_for` on production and found no lapse logic at all (row 4363), so a returning Day One listener has been charged £6.99 throughout (Ric's own sandbox return at 16:18 charged £6.99). Only the copy had to move.

## Options rejected

- **Editing version 1.2 in place.** 1.2 was published on 21 October under that number. Changing what a numbered version says without changing the number is the kind of thing a legal document should not do, and the 21 October change itself bumped the version line. It is 1.3.
- **Sweeping every Day One sentence on the site.** `claude-code`'s audit (row 4363) lists the lines that say a return costs £9.99 and says to leave every other £9.99 alone, because those are the standard price. This does exactly the lines on that list.
- **Leaving "for as long as you stay subscribed" in the table.** On its own it reads as though cancelling ends the price, which is now false.

## Evidence

- `legal.test.ts` now asserts the new wording and that neither "you return at £9.99" nor "for as long as you stay subscribed" is in the terms, and that no reinstatement or discretion wording is published. `dayOneTerms.test.ts` is unchanged and passes.
- 20 tests pass in the two files; the whole suite is run before merge. This repository has no CI, so the evidence is local.

## What this does not decide

- **`DAY_ONE_TERMS` and everything built from it still say "for as long as you stay subscribed"** (`lib/dayOneTerms.ts`, the FAQ schema, the homepage offer line, `llms.txt`, the Pulse articles, pinned by `dayOneTerms.test.ts`). Under the new rule that sentence is true but understates the promise. It is not on `claude-code`'s list and I have not changed it: it is the single sentence the whole site repeats, and Ric or Riz should say whether it should return to a "for good" wording. If so it is one constant and one test.
- Stale reasoning in comments (`lib/raaydrRates.ts`, `lib/dayOneTerms.ts`, `lib/pulse.ts`) still describes the 21 October rule. Not user-facing; left for the same change.
- Whether the terms version needs a `terms_versions` row on the platform before anyone can accept 1.3. v1.2 was never the accepted version either (see the 21 October record), so that is the same open item, `claude-code`'s.

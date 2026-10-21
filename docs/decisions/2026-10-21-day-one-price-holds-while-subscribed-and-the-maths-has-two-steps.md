# A Day One price holds while subscribed, and the listener maths takes costs off first

- **Date:** 21 October 2026
- **Decided by:** Ric, in chat with `claude-chat`; written up on board rows 3657 (section 4) and 3658. Built by `claude-deuce`.
- **Related:** `lib/dayOneTerms.ts`, `components/sections/WhereYourMoneyGoes.tsx`; supersedes `2026-09-24-the-site-says-forever-and-means-it.md`
- **Status:** DECIDED

## The decision

Two corrections to what raaydr.com says.

1. **The Day One price.** The site no longer says £6.99 is locked forever or survives a cancellation. It says the Day One listener pays **£6.99 a month for as long as they stay subscribed, and their Day One tape and number are theirs for good.** The sentence is written once, in `lib/dayOneTerms.ts`, with the price read from the rates file, and the homepage, `/about`, the `/for-listeners` page and FAQ, the FAQ schema, the homepage waitlist offer line, the calculator note, `public/llms.txt` and three Pulse posts all read from it (the Pulse posts through a new `{{rates.dayOne.terms}}` token).
2. **The "Do the maths" figure on `/for-listeners`.** It listed 55%, 10% (up to), 35% and then a 35% deduction, which reads as 135%. It now shows two steps. **Step 1:** tax, publishing royalties and card fees come off first (about 35% on the standard tier, about 36% on Day One), leaving about 65% (64%). **Step 2:** what is left splits 55% to artists, up to 10% to tastemakers, 35% to RAAYDR, which add to 100%. The deduction share is computed from the rates file exactly as before and was never typed.

## Context

On 24 September Ric ruled that "forever means forever" and the site was changed to say a Day One price survived a cancellation (board rows 1469 and 1470). On 21 October he replaced that: £6.99 holds while the subscription is active, including the normal payment grace period; someone who lapses for good and returns pays £9.99; and a Day One place is never released (row 3658). Only the price follows the subscription. The 24 September wording therefore became wrong on every page that carried it.

The maths section was one bar and one legend of four rows. The three shares are shares of the distributable amount, not of the subscription, and the fourth row (costs) is the part that makes it distributable, so putting all four in one list invited the reader to add them up.

## Options rejected

- **Keep the maths as one bar and add a note.** The note was already there ("shares of your subscription after tax..."), and the legend still read as 135%. A caption does not beat four numbers in a column.
- **Type the costs share.** It moves with the tier (35% standard, 36% Day One) and with the rates file. It stays computed.
- **Edit `content/legal/terms.md`.** See below.

## Evidence

- `lib/dayOneTerms.test.ts` fails if "locked forever", "lock £", "Day Ones lock" or "even if you/they cancel and come back" appears in any file that publishes Day One wording (comments stripped), and fails if anything that reads like reinstatement or discretion is published.
- The same test checks the FAQ data, the offer line and `llms.txt` carry the ruled sentence, and that the maths component names Step 1 before Step 2, reads `SPLIT.*` and types none of 55%, 35% or "up to 10%".
- `npx vitest run` passes (220 tests), `tsc` reports nothing in the changed files, and `eslint` reports the same 10 problems it reports on `main` (none in changed files).

## What this does not decide

- **`content/legal/terms.md` still says the Day One price is "Yours forever, even if you cancel and come back"** (a table row in the pricing section; a later line says "Your Day One place and price stay yours if you come back"). It is a legal document with a versioned acceptance flow on the platform side, so changing its wording is not a copy edit. It now contradicts the rest of the site and needs Ric and the solicitor. Flagged on the board; not touched here.
- **The platform's own entitlement logic** (`20260924210000_forever_means_forever.sql` in raaydr-platform) is `claude-code`'s section 2 and is not touched. The site now describes the ruled behaviour whether or not the platform yet enforces it.
- **Support reinstating £6.99 for one person** is internal. There is deliberately no sentence for it anywhere, and a test keeps it that way.

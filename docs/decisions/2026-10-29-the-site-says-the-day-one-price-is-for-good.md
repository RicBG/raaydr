# The site says the Day One price is for good, in the one constant and in the places that typed their own

- **Date:** 2026-10-29
- **Decided by:** Ric, 29 October 2026, 16:22 and 16:24 (platform board rows 4354 and 4355); the change itself was ordered by `claude-chat` on platform row 4385 ("Change `DAY_ONE_TERMS` to 'for good' to match 4354, with its test")
- **Related:** platform board rows 3657, 3658 (the 21 October rule this reverses), 1469, 1470 (the 24 September rule this restores), 4354, 4355, 4358, 4363, 4385; RicBG/raaydr#105 (terms v1.3); platform #710 (`/subscription`)
- **Status:** DECIDED
- **About:** `DAY_ONE_TERMS` and the five Pulse and llms.txt lines that typed their own now say the Day One price is for good, replacing "for as long as you stay subscribed".

## The decision

1. **`DAY_ONE_TERMS`** now reads "£6.99 a month for good, and your Day One tape and number are yours too" (and the third-person form). Every sentence built from it, the homepage offer line, About, the listener FAQ and its schema, the waitlist offer and `llms.txt`, follows. The price is still read from the rates file.
2. **Four places typed their own wording and are changed to match**, because "price holds while they stay subscribed" was now false: `public/llms.txt`, two lines of `content/pulse/what-is-raaydr.md`, one of `content/pulse/where-your-9-99-actually-goes.md`, and a clause in `components/sections/Calculator.tsx` ("Day Ones pay a lower price" with the "while they stay subscribed" dropped).
3. **The tests are rewritten for the 29 October rule.** `dayOneTerms.test.ts` now asserts the new sentence, fails if "for as long as ... stay subscribed" or "you return at £" comes back beside Day One, and keeps the guards against the 24 September "locked forever" phrasing and against ever publishing a reinstatement.

## Context

The 21 October rule said a Day One price held only while subscribed and a returning listener paid the standard price. On 29 October Ric reversed it. The charge never changed (platform row 4363: `price_entitlement_for` has no lapse logic), so the site was the only thing that said otherwise.

## Choices

- **"for good", once, and "too" for the tape.** The first draft was "for good ... yours for good", which read as a stutter in the offer line. The phrase is the ruling's own word.
- **Referral wording is untouched.** "For as long as they stay subscribed" on the referral calculator and on `terms.md` section 11 is about the referrer's pound a month, which genuinely does stop when the referred listener cancels. Those lines are not Day One lines.
- **The standard £9.99 is untouched everywhere.**

## Evidence

`npx vitest run` in this repository: 17 files, 240 tests pass, and `tsc --noEmit` is clean. This repository has no CI, so that is local; the Vercel build is the other check.

## What this does not decide

Terms v1.3 (#105), which is legal text and Ric's to read, and the `terms_versions` row, which is `claude-code`'s apply.

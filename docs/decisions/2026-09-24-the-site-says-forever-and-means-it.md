# The site says a Day One price is locked forever, surviving a cancellation

- **Date:** 24 September 2026
- **Decided by:** Ric, approving the wording at 21:24 — *"Wording was spot on!"* — after his 21:20 ruling that the price is locked forever. Drafted by `claude-chat`, shipped by `claude-code`.
- **Related:** Board rows 1469, 1470 and 1473. Platform side: `RicBG/raaydr-platform` PR #239 and migration `20260924210000_forever_means_forever.sql`.
- **Status:** DECIDED

## The decision

Three pieces of copy on raaydr.com now say that a Day One listener keeps £6.99 a month
**forever, even if they cancel and come back**. They previously said the price held *"for
as long as they stay subscribed"*, which is the opposite. Ric's words, on being asked what
should happen to an honoured price on a cancellation:

> *"I think they should be locked forever. I think forever means forever. So if they do
> cancel whenever they come back, they do get the grandfather plan."*

The approved sentences, used verbatim:

1. **The listener signup form note and the "Be one of the first 100" paragraph** —
   *"The first 100 listeners lock £6.99 a month forever, even if they cancel and come
   back. After that, RAAYDR is £9.99."*
2. **The note under the calculator** — *"Day Ones lock a lower price forever, so a Day One
   fan sends less your way than a standard subscriber does. Standard is the steady state,
   which is why it's the default here."*
3. **The FAQ, "What's the Day One offer?"** — *"The first 100 listeners are the Day Ones.
   They get RAAYDR at £6.99 a month, locked forever, even if they cancel and come back,
   against the standard £9.99."*

## Context

The promise and the mechanism had to move together, and the ordering was ruled explicitly
on board row 1473: **ship the copy in the same release as the forever rules, not before.
The site must not promise forever before the platform does it.** The platform side landed
first — `honoured_accounts` records the entitlement against the ACCOUNT rather than
against a subscription, so there is nothing for a cancellation to take away — and this is
the half a visitor can read.

The numbers in all three sentences are interpolated from `lib/raaydrRates.ts`
(`PRICING.dayOneCap`, `PRICING.dayOne`, `PRICING.standard`) rather than typed out, which
is the existing convention in those files and the reason the approved literals "100",
"£6.99" and "£9.99" do not appear as literals in the diff. The words are unchanged; only
their source is.

## Options rejected

**Rewriting every hit the sweep found.** Row 1473 was explicit: where a hit is not one of
the three approved sentences, report it and let `claude-chat` draft it for Ric. Four
user-facing hits are therefore still live and are listed under Evidence. Improvising
replacement wording for a promise about money is exactly the thing that rule exists to
prevent.

**Leaving the `lib/raaydrRates.ts` docblocks alone.** These were changed, and it is the
one judgement call in this diff. They are code comments, not copy shown to anyone, so
they are not "wording" in the sense row 1473 restricts — and they stated the OPPOSITE of
a ruling made the same evening, in the file every other number on the site is read from.
The equivalent docblock in `raaydr-platform`'s `packages/rates` was corrected in the same
release, so leaving this one would have left the two repositories disagreeing about what
Ric decided. Anyone who thinks that was the wrong call should say so; it is one comment
block to revert.

## Evidence

`npm test` — 121 tests across 8 files, all passing. `npm run build` — succeeds. `npm run
lint` reports 10 problems (7 errors, 3 warnings), and **the identical 10 appear on a clean
`main`**, checked by stashing this change and re-running: they are pre-existing and none
of them is in a file touched here.

Read back out of the built output rather than out of the source:
`.next/server/app/index.html` contains **6** occurrences of "cancel and come back" and
**0** of "stay subscribed". All three approved sentences appear as served.

**The sweep row 1473 asked for**, across the whole repository, for "stay subscribed", "as
long as" and "locked for". Four user-facing hits remain, none of them one of the three
approved sentences, all reported rather than rewritten:

- `app/for-listeners/page.tsx:35` — the /for-listeners offer paragraph.
- `components/AboutContent.tsx:110` — the /about pricing paragraph.
- `lib/faqData.ts:207` — the listener FAQ's own Day One answer, a near-duplicate of the
  one that was approved, ending *"There is no lock in beyond keeping your price."*
- `lib/faqData.ts:228` — *"no lock in beyond keeping your Day One price for as long as you
  stay subscribed."*

**And one finding that was not about wording at all, now fixed on Riz's authority.**
`public/llms.txt` published the **retired** pricing model: *"the first 1,000 listeners, in two price
bands... The first 250 pay £6.99 a month and the next 750 pay £7.99."* Day One became a
flat 100 listeners at £6.99 on 24 September (board row 1416, shipped in #77), and #77
updated the components but not this file. It is a live public file served at
`raaydr.com/llms.txt` and read by AI crawlers, so it was telling them a price band that no
longer exists.

**It is corrected in this PR.** Board row 1486 item 1 rules the fix in as "facts only, diff
on the board", which is what this is: the figures now match `lib/raaydrRates.ts` (100
listeners, GBP 6.99, standard GBP 9.99), and the only phrase added, "locked forever, even if
they cancel and come back", is Ric's own approved wording from row 1473 rather than anything
improvised here. The structure, tone and the closing sentence about terms being published on
the site are untouched. It still moves published numbers, so it ships parked in this PR for
Ric rather than merged.

Three Pulse posts (`what-is-raaydr.md`, `where-your-9-99-actually-goes.md`,
`what-is-attention-based-streaming-payment.md`) also still cite the two-band structure.
That is **already known and deliberately out of scope** — the docblock above `PRICING` in
`lib/raaydrRates.ts` records #77 flagging it as editorial work — so it is repeated here
only so the sweep's answer is complete, not as a new finding.

## What this does not decide

**Whether a Day One place is claimed at signup or at first payment.** It is claimed at
SIGNUP today, on the platform side, which means the 100 places fill with accounts rather
than with subscribers. That is raised on the board as a correction and is Ric's to rule
on; it changes nothing a visitor reads, because the price is £6.99 either way.

**The four remaining hits and `llms.txt`.** Waiting on drafted wording and, for
`llms.txt`, on Ric, since it moves published numbers.

**Nothing about how the promise is honoured for people who already joined.** The 185
waitlist joiners from before the pricing change are handled entirely on the platform side;
no surface on this site mentions them, and whether they are ever told is open.

# Ticket discounts come out of the loyalty copy; merch discounts stay

- **Date:** 24 September 2026
- **Decided by:** `claude-deuce`, verifying `work_items` 114 against `RicBG/raaydr-platform`'s
  phase-two data model before building
- **Related:** `app/artists/page.tsx`, `app/for-listeners/page.tsx`,
  `raaydr-platform/docs/raaydr-player-phase-two-data-model-2026-08-24.md`
- **Status:** DECIDED

## The decision

Both the artists page and the for-listeners page described RAAYDR's fan-loyalty unlocks
as including "discounts on merch and tickets." The word "tickets" is removed from both.
Merch stays: "Discounts on merch." is now the full clause on each page.

## Context

`work_items` 114 (backlog, `kfgootvqcdnfdzzustyb`) carried a note from the retired launch
checklist: "Both pages present them as how unlocks work. The spec has them as v2," marked
to verify before building since it had not been touched since early September.

Read against `raaydr-platform/docs/raaydr-player-phase-two-data-model-2026-08-24.md`
section 3.3, the launch menu of artist-delivered unlocks includes `merch_discount` — real,
buildable, shipping at launch. Ticket discounts are not on that menu at all: the document
says plainly, "Ticket discounts are out of the launch menu. They sit with third party
ticketing and RAAYDR cannot deliver or verify one. The enum carries them the day a
ticketing integration exists." So the item's premise was half right: only one of the two
named rewards is actually v2.

## Options rejected

- **Remove the whole sentence.** Would also drop the true, deliverable claim about merch
  discounts, which is exactly the kind of tangible unlock this copy exists to sell.
- **Leave both and wait for a ticketing integration.** The copy is read by artists and
  listeners today, promising a mechanism RAAYDR cannot currently deliver or verify. A
  platform that tells people what "unlocks" work should not name one it cannot honour yet.
- **Rephrase rather than remove** (e.g. "discounts on merch, tickets when we can verify
  them"). Heavier than the sentence needs and turns a clean two-item list into a caveat;
  the plain fix is to say only what is true.

## Evidence

- `grep -rn -i "ticket"` across `.ts`/`.tsx`/`.md`/`.json` in this repo found exactly two
  instances of the false claim (`app/artists/page.tsx:54`, `app/for-listeners/page.tsx:50`)
  and one unrelated illustrative use in a Pulse blog post, left untouched.
- No test pins this copy (`grep` for `.test.ts`/`.test.tsx` referencing "merch and tickets"
  found nothing), so removing the word needed no test update.
- `npm run lint`, `npm test` (121 passing) and `npm run build` all clean on this branch.
  The pre-existing lint findings in `RealNumbers.tsx` and `animated-gradient.tsx` are
  unrelated to this change and were not touched.

## What this does not decide

Whether ticket discounts should be added to the launch menu once a ticketing integration
exists is not this record's call; the phase-two document already says the enum is ready
for that day. This also does not address the two other pages the phase-two document's
`merch_discount`/`thank_you_message` distinction might eventually touch (this repo's copy
about how unlocks are delivered, `platform_delivered` vs `artist_delivered`) — out of
scope for a two-word removal.

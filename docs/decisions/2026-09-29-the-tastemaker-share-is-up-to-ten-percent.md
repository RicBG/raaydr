# The tastemaker share is up to 10%, and every number derived from it moved with it

- **Date:** 29 September 2026
- **Decided by:** Ric, in chat on 29 September, relayed by `claude-chat` on `ops.handoff` rows 2009, 2010 and 2023. Built by `claude-code`; the derived figures were put to Ric on rows 2017 and 2018 before anything was committed and confirmed by him on row 2023
- **Related:** `lib/raaydrRates.ts`, `lib/pulse.ts`, `lib/faqData.ts`, `lib/calculator.test.ts`; board rows 2002, 2005, 2009, 2010, 2017, 2018, 2023; explainer film 4; `RicBG/raaydr-platform` `packages/rates`
- **Status:** DECIDED
- **About:** The ring-fenced tastemaker share falls from up to 15% of distributable revenue to up to 10%, RAAYDR's rises from 30% to 35%, and the artists' 55% does not move. The per-fan figures derived from the share fall with it, from 97p to 64p on the standard tier.

## The decision

The split is **55 artists / up to 10 tastemakers / 35 RAAYDR**, each a share of distributable
revenue. Ric, asked whether the tastemaker share was 15% or the proposed 10%: *"Yes it's the
new split of 10."*

The artists' share did not move. RAAYDR's did, because the three must sum to 100 and the five
points had to come from somewhere.

## What moved that the ruling does not name, and why it is here rather than in a footnote

The ruling is about a percentage. **The percentage is not the only published number that a
percentage decides.**

`PER_FAN.tastemaker` is the fund's size expressed per fan. It is derived, not typed:
`floorToPence(DISTRIBUTABLE_EXACT * share)`. So the ruling moves it by arithmetic:

| | 15%, until today | 10%, ruled |
| --- | --- | --- |
| standard tier | 97p | **64p** |
| Day One, £6.99 | 67p | **44p** |
| the retired £7.99 band | 77p | **51p** |

**And therefore the calculator on `/tastemakers` moves.** Its own worked example, 1,000
followers at a 20% driven share, falls from **£194 a month to £128**.

That was put to Ric before any of this was committed, because `CLAUDE.md` says anything moving
a published number goes to him first, and 64p is a figure nobody had quoted. He confirmed all
of it on board row 2023: *"whatever affects that needs to be changed, make the changes,
including calculators and terms, wherever it exists."*

**There was never a version where only the copy moved.** Copy reading 10% beside a calculator
still paying out of 15% publishes a contradiction rather than a decision, so the two had to
ship together or not at all.

## Most of this change is about the next ruling, not this one

The share was stated in nine places and **every one of them had its own hand-typed copy of it.**
That is the condition that makes the next change expensive, so the change is mostly the removal
of those copies.

- **`lib/pulse.ts` gains `rates.split.artists`, `.tastemakers` and `.raaydr` tokens.** Four
  Pulse posts each spelled the percentages out. That is precisely the failure the token map was
  built for, and its own docblock says so: *"a pound figure typed into a post is a copy of a
  rate, and copies go stale silently."* There were tokens for per-fan rates and for
  distributable, and none for the split.
- **Every remaining statement reads `SPLIT`** rather than a literal: both FAQ answers, the
  About page's "the split is simple and public" paragraph, the calculator footnote, the
  `/tastemakers` lead, and its `<meta name="description">`.
- **`WhereYourMoneyGoes`'s `aria-label` is the one worth naming.** It spelled all three shares
  out by hand **beside a bar whose widths are computed from `SPLIT`**, so the picture and the
  announced description could disagree with each other. Only a screen reader user would have
  met the stale version.
- **`lib/raaydrRates.ts` now throws at module load if the three shares do not sum to 100.** The
  platform repository's rates file has had that assertion since it was written, on the engine
  spec's first principle that money in equals money out. This side had nothing, so a copy change
  that moved one share and left the others could have published a split summing to 95.

## What was deliberately left alone, checked rather than assumed

A find-and-replace on "15%" and "30%" would have been wrong in four places:

- **`how-much-does-spotify-pay-per-stream.md`: "Spotify collects... keeps roughly 30%."** That
  is Spotify's share of its own revenue.
- **`RealNumbers.tsx`: "top 15%."** A percentile.
- **`faqData.ts`: "commonly around 30 percent of that song's share."** A producer or songwriter
  split negotiated between people, unrelated to the revenue split.
- **`app/terms/page.tsx` states no percentage at all.** Ric's "and terms" has nothing to change
  here; `/terms` describes distributable revenue as "shared between artists, tastemakers and
  RAAYDR" without naming a number. Worth recording so nobody goes looking for the edit that
  was not made.

## One test was rewritten rather than renumbered

`calculator.test.ts` carried *"cannot reach £0.76 from the artist rate's own implied range"*.
It encoded a specific 3 August dispute: the 8p-Connect story explained the retired £2.82 but
never explained £0.76, because 15% of that waterfall still floors to 77p.

**At a 10% share the figure is 51p, so the assertion's threshold is simply false.** Renumbering
0.76 to something new would have kept a green test that no longer guards anything, because the
dispute it encoded is about a rate nobody pays.

What was load bearing is the **method**: that the tastemaker rate is *reachable* from the artist
rate's own implied distributable range rather than typed beside it. That is what it asserts now,
and it still fails on a hand-typed tastemaker rate, which is the fault that put £0.76 on the
live site for four days.

## Verification

- `npx tsc --noEmit`: clean.
- `npx vitest run`: **123 passed**, up from 121. The two new ones pin that the split sums to 100
  and that it carries this ruling.
- `npm run build`: completes, and **all nine Pulse posts prerender.** That is the check that
  matters for the new tokens rather than a nicety: `substituteTokens` throws on an unknown token
  name, so a typo in `rates.split.tastemakers` would fail the build rather than render a blank.
- `npx eslint`: 10 problems, the identical set as `main`, none in any file this change touches.

The figures themselves were reproduced at 15% first, before being changed, so the derivation was
proven rather than asserted: `floorToPence(6.48322 * 0.15)` returns exactly the 97p the site
publishes today.

## What this does not do

**It does not touch the platform repository**, where `REVENUE_SPLIT_BPS.tastemakerFund` is still
1500 bps and `PUBLISHED_TASTEMAKER_RINGFENCE_MINOR` is still 99p and 69p. Those move in a
separate pull request, to 1000 bps and to 65p and 45p, keeping the round-up in the creator's
favour that the constant's docblock states as policy. Ric confirmed those figures on row 2023.

**Nothing published moves until both merge**, and explainer film 4 does not post until a live
fetch of raaydr.com shows the new figures.

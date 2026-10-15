# Pulse pages 2 to 5 ship as guides that carry the search term, with the tools left for later

- **Date:** 15 October 2026
- **Decided by:** `claude-eve` inside the plan Riz put to Ric on board rows 3252 and 3263; the tool builds were not ruled on and stay open
- **Related:** board rows 3252, 3263, 3347, 3375; branch `eve/pages-2-5`; `content/pulse/streaming-royalty-calculator-uk.md`, `split-sheet-template.md`, `prs-vs-ppl-uk-royalties.md`, `how-much-does-apple-music-pay-per-stream-uk.md`; `lib/pulse.ts`
- **Status:** DECIDED (draft, nothing published)

## The decision

Four more Pulse posts, in the same shape as the 1,000 stream rule post, each with a credited Unsplash hero:

| page | target term |
| --- | --- |
| Streaming Royalty Calculator UK | streaming royalty calculator uk, spotify royalty calculator |
| Split Sheet Template | split sheet template, music split sheet |
| PRS vs PPL | prs vs ppl, how to register with prs |
| How Much Does Apple Music Pay Per Stream in the UK? | how much does apple music pay per stream |

Pages 2 and 3 were planned on row 3263 as interactive tools at `/tools/...`. They are written here as guides with a worked table (page 2) and a copyable template (page 3), so the term is carried now. The tools themselves stay a later `claude-deuce` job; a guide and a tool can both exist and the guide links to the live calculator on `/artists`.

## Context

A guide ranks without any build work and ships as a markdown file. A tool needs a front end, a published rate for each platform, and Ric's yes on those rates. Waiting for the tool would leave two of the four highest value terms uncovered.

## How the numbers are held

- Every pound figure about RAAYDR is a `{{token}}` read from `lib/raaydrRates.ts`: the £3.56 per fan, the scenario, the denominator sentence. The 55/10/35 split and £3.56 were reproduced against `packages/rates` in raaydr-platform (55% of the 648.322p distributable floors to £3.56).
- The per stream estimates (Spotify £0.003, Apple £0.008, YouTube Music £0.0015) are the ones already published in the older posts. They are NOT in `packages/rates`, which has no per stream constants. No published number moved. The tables in the new posts are computed from them (`calc.*` and `needs100.*` tokens) so a rate change rewrites them.
- `PAYOUT.minimumThreshold` on this side said 50 while `packages/rates` says £25 (Ric, 3 and 9 October). Nothing read it and every page says £25, so it was corrected to 25 with a comment, not as a live change.

## Links and tracking

Each post carries one absolute link to raaydr.com with `utm_source=pulse&utm_medium=blog&utm_campaign=<slug>&utm_content=body`. Links between posts and to `/artists` stay relative and clean: `lib/analytics.ts` records that a UTM on an internal link restarts the GA4 session and detaches the visitor from the campaign that brought them. `lib/pulse.test.ts` fails any raaydr.com link without the UTMs.

## Options rejected

- **Shipping the tool pages first.** Slower, and needs rate approval.
- **Page 5 folded into page 2.** The terms differ (a calculator versus an Apple specific question) and the second would be lost.

## What this does not decide

- The facts in the PRS and PPL post come from MN2S, PPL's own pages and CISAC. The £100 and £30 joining fees are stated as "has been, check the site", because the primary PRS pages were not reachable.
- Whether any of this goes live. Ric's yes comes first.

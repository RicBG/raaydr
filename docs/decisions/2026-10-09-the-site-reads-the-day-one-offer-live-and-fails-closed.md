# The site reads the Day One offer live, fails closed, and stops keeping its own copy of the prices

- **Date:** 9 October 2026
- **Decided by:** `claude-chat` ruled the mechanism on board row 2965; Ric's go on 2967, in his words: *"Yes, get the site in line with whatever wording needs to be correct."* Built by `claude-code`.
- **Related:** `work_items` 225; board rows 2962, 2965, 2967; `lib/platformSupabase.ts`, `components/DayOneStatus.tsx`, `lib/pulse.ts`, `lib/raaydrRates.ts`, `lib/faqData.ts`, `lib/dayOne.test.ts`. Follows PR #77, which corrected the body prose and left the rest.
- **Status:** DECIDED
- **About:** Every Pulse post and FAQ that states the Day One offer now carries one live line saying whether places are open, read from the platform at view time and failing closed, so a page can no longer go on selling a place that has gone. The prices and the cohort size stop being typed into prose and become tokens, the three "Update, 24 September 2026" notes in which posts argued with their own body text are gone, and the retired £7.99 second band is out of the rates file entirely.

## The decision

Four things, which are Riz's four points on row 2965:

1. **The Day One price, the standard price and the size of the cohort are tokens**, `{{dayOne.price}}`, `{{standard.price}}` and `{{dayOne.cap}}`, reading `PRICING` through `lib/pulse.ts`. No post spells any of them out. The three "Update, 24 September 2026" notes are deleted, because an article should say the true thing once rather than argue with itself.
2. **A live client component**, `DayOneStatus`, calls `day_one_listener_places_remain()` on the platform and **fails closed**: anything that is not an explicit `true` renders the closed wording. The pages stay static and are deliberately not revalidated.
3. **The FAQ carries the same component**, above the accordion rather than inside it.
4. **`dayOneNext`, `dayOneFirstBand` and `DAY_ONE_NEXT_BAND` are gone** from `lib/raaydrRates.ts`, with the `PricingTier` union, the `siteConfig` block and the calculator's unreachable label following them out.

## Context

Ric replaced the Day One cohort on 24 September 2026 (board row 1416): one flat band of 100 listeners at £6.99, instead of 1,000 in two bands, 250 at £6.99 and 750 at £7.99. PR #77 rewrote the body prose of the posts that described the old structure.

**What it left behind is the whole subject of this record.** Three posts gained a line reading *"Update, 24 September 2026: Day One is now the first 100 listeners at £6.99 a month"* sitting directly above body text that already said exactly that. A reader meeting "Update: X is now true" reasonably assumes the body says something else. And `lib/raaydrRates.ts` went on carrying the retired band under a docblock explaining that it was *"UNUSED BY ANY LIVE PRICE OR COPY"* but retained because *"three published Pulse posts cite the retired two-band structure and its £7.99 figures as history, and rewriting them is editorial work outside this ruling's scope"*.

**That reason was true when it was written and stopped being true the moment #77 merged, and nothing noticed.** The constant was kept alive by a dependency that had quietly expired. It is the same failure as a stale comment, except this comment was load-bearing: it is what stopped the next person deleting the band.

The second half is the one that could cost somebody money. Every statement of the offer on this site was a **static** sentence. The platform knows how many Day One places are left; the marketing site did not ask, so a page built at place 99 would go on offering place 100 for as long as it was cached, to everyone who read it.

## Options rejected

**Revalidating the static pages on a timer.** The obvious fix and it does not hold: whatever the interval, a page rendered at place 99 sells place 100 until the next rebuild, and shortening the window makes the race rarer rather than impossible. The page stays static and the one live fact is read in the browser at view time.

**Reading the count instead of the boolean.** `day_one_places_left()` returns the number and is deliberately **not** granted to `anon` on the platform; `day_one_listener_places_remain()` returns one boolean and is. That is the platform's choice and the right one: a published count is a figure that can be quoted back at us, and "14 places left" on a marketing page is a claim with a clock on it. A test asserts this site asks for the boolean and never the count.

**Failing quiet, the way `AuthInfoPanel` does on the platform.** Row 2965 says this component "matches `AuthInfoPanel`, so both sites behave the same". It does not, quite, and the difference is deliberate. `AuthInfoPanel` renders nothing on an error, because it is a stat beside a signup form and an error on the page somebody is joining from is worse than a missing line. This one renders the **closed** wording, because it is the offer itself on a marketing page: a missing line here would leave the surrounding prose selling a price with nothing qualifying it. The ruling's own words are "fails closed ... never the offer", and that is what is built.

**Listing which posts get the line, in the component.** A slug list would be correct the day it was written and wrong the first time somebody published a post mentioning the offer — which is exactly how three posts came to carry a stale Update note. The flag is computed from the post's own source (`citesDayOneOffer`, true when the raw markdown contains a Day One token) and, in the FAQ, set on the answer that states the offer (`statesDayOneOffer`). Move the answer to another page and the live line follows it.

**Putting the line inside the FAQ accordion.** The rows are collapsed on load, so a live status inside one would be invisible to everybody who does not open it. It sits above the list.

**Leaving the terms page alone — kept, not rejected.** `content/legal/terms.md` states £6.99, £9.99 and the first 100 as literals. Those are correct today, it is approved legal copy, and a contract is not a place to introduce build-time interpolation on somebody else's say-so. Untouched, and raised rather than changed.

## Evidence

**45 assertions in `lib/dayOne.test.ts`**, plus the existing suite: 212 tests across 12 files, `tsc --noEmit` clean, `next build` green, and the routes still render as `○ (Static)` and `● (SSG)` — which is point 2's "no revalidation" shown rather than claimed. ESLint reports 7 pre-existing errors in animation components, none in any file this touches.

**Five mutations, each caught by a named assertion:**

| mutation | caught by |
| --- | --- |
| `=== true` becomes a truthy check | the four truthy-non-boolean cases |
| the non-2xx guard is dropped | "is closed on a non-2xx, however it is worded" |
| the `catch` returns `true` instead of `false` | "is closed when the request throws" and the unparseable-body case |
| an "Update, 24 September" note restating a price comes back | "carries no Update note restating a price" |
| a price is hand-spelled back into the prose | "spells no Day One or standard price by hand" |

**Both states were driven in a real browser** — Chromium against `next build && next start` on localhost, with a twenty-line Node stand-in answering the RPC, so the run reached no project at all and the answer could be set either way. Captured on `/pulse/what-is-raaydr` and `/for-listeners`, at 1440 and 390:

```
open   desktop/phone  data-state=open    "Day One is open. The first 100 listeners pay £6.99 a month, locked forever..."
closed desktop/phone  data-state=closed  "Day One is closed. All 100 Day One places have gone. RAAYDR is £9.99 a month..."
```

**The static HTML ships `data-state="closed"`.** `curl` with no JavaScript at all returns the closed wording, which is the strongest form of the guarantee: a crawler, a reader with scripting off, and a deployment that cannot reach the platform all see the same honest line.

**Two defects were found by looking at the captures rather than by reading the code.** The first: the site's boot curtain covered the page, so the first screenshots were a logo on a blank field — the DOM text was right and the picture was useless, which is a reminder that a passing assertion about `innerText` is not a picture. The second is a real one: the closed state tinted `--stone`, a light-canvas token, and the FAQ accordion sits on `--deep`, so on that page it rendered as a muddy grey slab with an invisible border. It tints `currentColor` now and lifts whatever surface it is on, in either direction, with no breakpoint and no parent-aware class.

**A published number was found wrong on the way past.** `PAYOUT.minimumThreshold` in `lib/raaydrRates.ts` was £50. Ric ruled £25 on 3 October 2026, and the platform's `packages/rates` moved that evening. **Nothing rendered it** — the constant was unimported, and the figure a reader sees had been hand-corrected to £25 separately in the post and in the terms — so no visitor ever saw £50. It is corrected to 25 and the post now reads it through a `payout.minimum` token, because a dead constant holding a superseded published number is a trap set for whoever wires it up next: it would have shipped the old figure silently with a plausible source behind it.

## What this does not decide

**Three other surfaces still state the offer statically, and they are not in this change.** `components/sections/FirstWave.tsx` on the home page, `components/AboutContent.tsx`, and `app/for-listeners/page.tsx` each say the first 100 listeners lock £6.99. The reasoning for the live line applies to them identically, and the home page is the most-read of the four. Row 2965 names the Pulse posts and the FAQ, so that is what is built; extending the same component to the other three is a one-line change per surface and is **offered to Ric rather than taken**, because it moves what the home page says.

**The terms page keeps its own figures**, as above.

**`where-your-9-99-actually-goes` has the standard price in its title, its description and its URL.** The body is tokenised; a slug is a published address and a title is the piece's identity, so neither is something to rewrite quietly. If the standard price ever moves, that post needs an editorial decision, not an interpolation. Raised, not done.

**The cross-repo drift between this `PAYOUT` and the platform's is filed on the backlog**, as row 2965 point 4 asks. The platform's `packages/rates` is the authority and carries `lagDays` and `firstPayoutHoldDays`; this object has neither and nothing here needs them. The fix is not to copy more numbers across.

# Every surface that sells a Day One place reads the live count, and none of them prints £6.99 when places have gone

- **Date:** 28 October 2026
- **Decided by:** the mechanism is `claude-chat`'s, board row 2965, approved by Ric on 2967. The sweep is board row 4212 ("list every place £6.99 is offered (site, signup, emails) and switch each off the live count"), `work_items` 225. Built by `claude-deuce`.
- **Related:** `docs/decisions/2026-10-09-the-site-reads-the-day-one-offer-live-and-fails-closed.md` (the mechanism, from the first, unmerged, attempt at this); `lib/dayOneOffer.ts`, `components/DayOneOffer.tsx`, `components/useDayOnePlacesRemain.ts`, `lib/llmsTxt.ts`, `app/llms.txt/route.ts`.
- **Status:** DECIDED
- **About:** Every place on raaydr.com that offers the £6.99 Day One place now asks the platform at view time and fails closed, so with the cohort full the site stops printing £6.99 anywhere a visitor can read it. That is the "done when" on 225, shown on five pages at two widths.

## Why this exists

`day_one_listener_places_remain()` has existed on the platform since the Day One offer was built, and `PlayGateModal` and the signup `AuthInfoPanel` already read it. The marketing site did not. Every sentence on it that said "the first 100 listeners get £6.99" was static, so a page built at place 99 went on selling place 100 for as long as it was cached. Row 2965 ruled how to fix that (a client component that fails closed, pages stay static, nothing is revalidated) and row 4212 asked for the full list of places and for each to be switched.

## The full list

**On the platform (`raaydr-platform`), nothing to change.** Signup (`AuthInfoPanel`) and the play gate (`PlayGateModal`) already read the live boolean and fail quiet. `/subscription` states what a person holds, not an offer. **No email renders the price**: the Day One emails carry the tape and the number, not £6.99. Checked by search, not remembered.

**On the site, every one of these printed £6.99 and now does not when places are gone:**

| Surface | What it said | Now |
| --- | --- | --- |
| Home, closing section (`FirstWave`) | "Be one of the first 100." plus the offer sentence | Headline is "Early counts here." in both states; the sentence below is the live one |
| Waitlist forms, offer line under the role picker (`WaitlistForm`, `offerFor`) | The listener offer | Live; creator roles unchanged |
| About (`AboutContent`) | "The first 100 Day Ones ... at £6.99" | Live |
| For listeners, second point (`for-listeners`) | The same sentence | Live |
| Home and listeners FAQ, "What's the Day One offer?" and "Can I cancel any time?" | The offer, in the answer and in the FAQPage JSON-LD | `closedAnswer`; JSON-LD carries the closed one |
| The three calculators' tier radio ("£6.99 · first 100") | The offer as a label | "Day One" when closed; the maths underneath is unchanged |
| Pulse: `what-is-raaydr`, `what-is-attention-based-streaming-payment` | The offer in prose, a table row, a closing paragraph | `{{if dayOne.open}}...{{else}}...{{end}}` in the markdown, a `{{row dayOne.open}}` table row, and the status line from the first attempt |
| Pulse: `where-your-9-99-actually-goes`, and the per-fan sentences | The price, to describe Day One economics | The price is simply not there: "a lower price", "on the Day One price" |
| `llms.txt` | A static file in `public/` | A dynamic route over `content/llms.txt`; the tier line is chosen on the server |

**Left alone on purpose, and raised.** `content/legal/terms.md` states £6.99, £9.99 and "the first 100" as literals. It is approved legal copy and a contract is not where build-time or view-time interpolation belongs on anyone's say-so but Ric's and the solicitor's. Dated Pulse posts that are not in the list above carry no price. Whether the terms table should say places are full is Ric's.

## How it works

`useDayOnePlacesRemain()` starts `false` and becomes `true` only on an explicit `true` from the platform. Everything that sells a place renders its CLOSED wording in the static HTML and swaps to the open one only on that answer. So a crawler, a reader with JavaScript off, a preview deployment with no platform variables, and a platform outage all see the closed wording. Mounting several of these on one page shares the request already in flight and caches nothing.

Where the offer is a SENTENCE it has an open and a closed form written side by side (`lib/dayOneOffer.ts`; `closedAnswer` on a FAQ item; the conditional in a post). Where it is only a DESCRIPTION of what Day Ones pay, the price was taken out rather than made conditional.

## Options rejected

**One closed banner on each page and leave the prose.** That is what row 2965 did for the Pulse posts, and it is honest, but it leaves £6.99 in the body of a page whose banner says places have gone. The done-when on 225 is that the site "no longer mentions £6.99", and a banner contradicting its own page does not meet it.

**Swapping the home headline with the sentence.** The headline is split into lines by `useMaskedReveal` once, and changing text under a split breaks the reveal. A headline that reads right in both states was the cheaper answer than a remount.

**Making `llms.txt` revalidate every few minutes.** A window is a race made rarer, not removed. It is read per request and not cached; the traffic is a handful of crawlers.

**Dropping the Day One tier from the calculators when closed.** Day One listeners exist, and an artist is entitled to ask what one sends them. Only the offer wording goes.

## Copy that is not approved wording

All the closed wordings are plain facts and are listed here for `claude-chat` to confirm or replace: "All 100 Day One places have gone. RAAYDR is £9.99 a month." (every surface); the FAQ closed answer to "Can I cancel any time?" ("Yes, it's a standard monthly subscription with no lock in, and you can cancel at any time."); the headline "Early counts here."; and the calculator label "Day One".

## Evidence

`tsc --noEmit` clean; vitest 298 passing; `next build` green with `/`, `/about`, `/for-listeners` and every post still static (`○` and `●`) and `/llms.txt` the only dynamic route. ESLint reports 7 errors in animation components that this change does not touch.

**The static HTML ships no £6.99 on any of the six pages** (home, About, for-listeners and three posts), in visible text or JSON-LD, counted by script. A browser against `next build && next start` and a twenty-line stand-in for the RPC, so nothing real was read or written, answered both ways: with the stand-in closed, the page text on home, About, for-listeners and `what-is-raaydr` contained no £6.99 at 1440 and at 390; with it open, each showed the offer.

**What was not checked:** the live platform from a Vercel preview, because the agents cannot open those hosts. The preview needs `NEXT_PUBLIC_PLATFORM_SUPABASE_URL` and `NEXT_PUBLIC_PLATFORM_SUPABASE_ANON_KEY` set for previews to show the open state; without them it will, correctly, show closed. That is `work_items` 225's other half: with the staging cohort filled, raaydr.com and the signup screen no longer mention £6.99. Filling a cohort on staging is a write and is Ric's to allow.

## What this does not decide

The terms table, as above. The `where-your-9-99-actually-goes` title and slug, which carry the standard price and are not touched. A count of places left, which stays private on purpose.

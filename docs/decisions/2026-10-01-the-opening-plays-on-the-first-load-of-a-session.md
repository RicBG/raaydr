# The site's first-load curtain becomes the Opening on the first load of a session

- **Date:** 1 October 2026
- **Decided by:** Ric, 1 October (platform board rows 2396 and 2401): the Opening plays in the Control Room and on raaydr.com, not on public artist pages or the listener side, and holds about a second longer than the first cut.
- **Related:** the Control Room half, `RicBG/raaydr-platform` PR #435 (record `2026-10-01-the-opening-plays-once-and-ends-when-the-page-is-ready.md`). This repository's hold-up: `RicBG/raaydr` #82 is a draft on hold, and this change is its own pull request rather than part of it, on Ric's instruction.
- **Status:** DECIDED. The 3.5 second hold is a starting point to be judged by eye on the preview. Revised the same evening after Riz's check and Ric's own phone, see below.

## The decision

The first load of a browsing session, and any load with `?opening=1` in the address, plays the Opening: the ground, the lockup (the four bars and the wordmark) fading and settling in, the bars breathing, a 3.5 second hold, then a 0.9 second push out towards the reader while the veil lifts off the page. It uses the curtain this site already had rather than adding a second overlay. It ends at the hold whatever the page is doing, about 4.5 seconds in all. Every later load, and every reload, still gets the short curtain it always had.

## Context

The platform's Opening was built as a Control Room screen and first covered every route there. Ric then ruled it should play in the Control Room and on the marketing site, once per session, and hold longer.

raaydr.com already has a first-load curtain (`components/BootScreen.tsx`, `lib/boot.ts`, the `data-booting` attribute). It exists for a different reason: fonts, hydration and two WebGL contexts all land in the same few seconds, and because `body` sets `overflow-anchor: none` every re-flow slides the page under a reader who has already started scrolling. The curtain holds the reader at the top until the page has stopped moving, and it covers a reload part way down the page. A second overlay beside it would have been two covers on one paint, and the Opening's job (a brand moment on arrival) is a subset of what the curtain's markup and timing already do.

## Options rejected

- **A separate `<Opening />` component beside `BootScreen`.** Two full-screen covers on the first paint, two scripts deciding when to lift, and two sets of "what if JavaScript never runs" guarantees to keep in step. Rejected.
- **Replace the curtain with the Opening on every load.** The Opening is meant to be a first-visit moment (Ric: first visit of a session). Putting a 3.5 second lockup on every reload would also make a reload part way down the page, the case the curtain was built for, cost 3.5 seconds each time. Rejected.
- **Play the Opening once and remove the curtain afterwards.** That would reintroduce the page-shoving the curtain fixes, on every later load. Rejected.
- **The platform's page "rise" (a short `translateY` as the veil lifts).** This page pins sections with ScrollTrigger and positions elements fixed. A transform on an ancestor makes a fixed element position against that ancestor instead of the viewport, and the platform's own record explains why its rise ends with no transform left behind. Here the veil fading is what lets the page through, which is the only difference from the platform's version. Rejected.
- **Reuse the short curtain's `MAX_MS` (3.8s) as the cap.** It would cut the lockup off before it had held 3.5 seconds on a slow page. The Opening has its own cap, `OPENING_MAX_MS`, 3.6 seconds, see the revision below.

## Evidence

- `lib/boot.test.ts`: 24 tests (9 existed). The head script is run against stubbed browser globals, not read as text. New cases: plays on the first load and says so; does not play on a later load of the same session; the flag is written at the start; `?opening=1` replays; `?opening=11` and `?xopening=1` do not; blocked storage plays nothing and the short curtain still runs; the signup cover wins and does not spend the session's one play; the hold is not shortened by a warm load; ends as soon as the page is ready after the hold; both attributes come back off and the node is never removed; lifts without `load`; reduced motion is a shorter, different animation.
- Four mutations on the real file, each failing exactly the guard it should: flag never written, hold replaced by the short minimum, escape replaced by the short maximum, `data-opening` left behind.
- Rendered against `next build && next start` on localhost with Chromium (`--no-proxy-server`): first load of `/` plays (`data-opening="1"` at 2.0s, gone by 5s); a reload gets the short curtain; `?opening=1` replays; a first load of `/terms` plays (any path); reduced motion carries `data-opening="reduced"`. Frames at 0.15s, 0.7s, 2.0s, 3.6s, 3.9s, 4.2s and 4.9s at 1440 and 390, and reduced motion at 1440, are on the `captures/opening` branch of this repository.

## Revised 1 October 21:00 (platform board rows 2417 and 2418)

The first cut was previewed and failed two checks. Riz recorded it with a throttled headless Chromium and saw the lockup held for 9 to 10 seconds on one run and the hero's copy showing through the lockup on another. Ric then saw it on his own phone: *"I saw a flash of the logo, and then I saw a flash of the orb, and then it went back to the logo."* Three causes, each found by logging rather than guessed, each fixed, and a fourth change Riz asked for.

1. **It waited for the page.** The first cut ended at the later of the hold and "fonts, load and an idle frame", with an 8 second escape. On a throttled run that wait was the whole 9 to 10 seconds, and for a visitor from an ad it is a bounce. It now ends at the hold plus 0.1 seconds whatever the page is doing (`OPENING_MAX_MS` 3.6s), then the 0.9 second push out, **about 4.5 seconds in all**. This is a deliberate difference from the Control Room's Opening, which does wait for hydration up to a fail safe: there the page behind is the product, here the short curtain's own cap was already 3.8 seconds. A CSS-only backstop (`boot-cap` in `globals.css`) takes the veil out of sight at 4.4 seconds even if script itself is late; it animates `visibility` and nothing else, because a first cut that also animated `opacity` fought the push out's own transition on a throttled run and cut the lockup off in one frame.
2. **A root view transition snapshotted the curtain.** The site wraps its routed content in React's `<ViewTransition>` (`RouteTransition`), which starts a root `document.startViewTransition` when the page hydrates. A root transition snapshots the whole viewport, the curtain included: the lockup is faded out (`route-out`) and a copy faded back in from below (`route-in`), and the frozen snapshot lasts as long as the update takes. Logged on a throttled run it started at 2.5 seconds and ran for a second, in the middle of the hold. That is the "flash of the logo, then back to the logo". While the curtain is up a transition is now skipped, once it is ready (skipping before ready rejects the promise React chains onto and surfaced as an uncaught `AbortError`; found and fixed in the same session). It applies to the short curtain too.
3. **The page showed through the lockup.** The veil faded as a whole, lockup included, so the hero's text came up underneath a half-faded lockup and the two overlapped. `.boot` now keeps opacity 1 and only its background fades, starting 0.4 seconds in, after the lockup's own 0.5 second push out has all but finished. The page is not visible until the lockup has gone.
4. **"Attention over streams." is now "Attention pays."** on the hero (`components/sections/Hero.tsx`), Riz's finding on the same capture. The whole repository was searched; this was the only occurrence of the old line.

**Options rejected in the revision.** Removing the root view transition site wide (it is the site's route animation and the flash only happens while the curtain is up). Cancelling it with `skipTransition()` the moment it starts (rejects `ready`, uncaught). Fading the veil with opacity and shortening the lockup's push out to hide the overlap (the overlap is the fault, not its length).

**Evidence.** `lib/boot.test.ts`: 33 tests. New: the cap is later than the hold and the whole is at most 4.5 seconds; it ends at the hold with the page not ready; a view transition started while the curtain is up is skipped once ready, for the short curtain and during the push out, and left alone once the curtain has gone; the stylesheet lifts the veil by background rather than opacity, after the lockup, and the backstop animates visibility only and is timed to the end of the push out. Mutations: skip removed, cap restored to 8 seconds, skip condition disabled, background fade removed, opacity added to the backstop, each failing the right test. Recorded with Chromium's screencast at 1x, 4x and 6x CPU throttle at 1440 and 390: the lockup is fully gone before the hero appears at every rate, and no throttled run holds past about 4.9 seconds. View transitions now finish in 40 to 400 milliseconds instead of a second. Frames are on the `captures/opening` branch.

## What this does not decide

- **The hold.** 3.5 seconds is a starting point, one constant (`OPENING_HOLD_MS` in `lib/boot.ts`), to be judged on the preview.
- **Where else it plays.** raaydr.com only, as ruled. Public artist pages and the listener side are the platform's and are not touched.
- **Whether the later-load curtain should be retired.** It still does the job it was built for. That is a separate decision.
- **Web vitals.** The lockup covers the page for at least 3.5 seconds on the first load of a session. Not measured.

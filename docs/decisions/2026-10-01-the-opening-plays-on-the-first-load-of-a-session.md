# The site's first-load curtain becomes the Opening on the first load of a session

- **Date:** 1 October 2026
- **Decided by:** Ric, 1 October (platform board rows 2396 and 2401): the Opening plays in the Control Room and on raaydr.com, not on public artist pages or the listener side, and holds about a second longer than the first cut.
- **Related:** the Control Room half, `RicBG/raaydr-platform` PR #435 (record `2026-10-01-the-opening-plays-once-and-ends-when-the-page-is-ready.md`). This repository's hold-up: `RicBG/raaydr` #82 is a draft on hold, and this change is its own pull request rather than part of it, on Ric's instruction.
- **Status:** DECIDED. The 3.5 second hold is a starting point to be judged by eye on the preview.

## The decision

The first load of a browsing session, and any load with `?opening=1` in the address, plays the Opening: the ground, the lockup (the four bars and the wordmark) fading and settling in, the bars breathing, a 3.5 second hold, then a 0.9 second push out towards the reader while the veil lifts off the page. It uses the curtain this site already had rather than adding a second overlay. Every later load, and every reload, still gets the short curtain it always had.

## Context

The platform's Opening was built as a Control Room screen and first covered every route there. Ric then ruled it should play in the Control Room and on the marketing site, once per session, and hold longer.

raaydr.com already has a first-load curtain (`components/BootScreen.tsx`, `lib/boot.ts`, the `data-booting` attribute). It exists for a different reason: fonts, hydration and two WebGL contexts all land in the same few seconds, and because `body` sets `overflow-anchor: none` every re-flow slides the page under a reader who has already started scrolling. The curtain holds the reader at the top until the page has stopped moving, and it covers a reload part way down the page. A second overlay beside it would have been two covers on one paint, and the Opening's job (a brand moment on arrival) is a subset of what the curtain's markup and timing already do.

## Options rejected

- **A separate `<Opening />` component beside `BootScreen`.** Two full-screen covers on the first paint, two scripts deciding when to lift, and two sets of "what if JavaScript never runs" guarantees to keep in step. Rejected.
- **Replace the curtain with the Opening on every load.** The Opening is meant to be a first-visit moment (Ric: first visit of a session). Putting a 3.5 second lockup on every reload would also make a reload part way down the page, the case the curtain was built for, cost 3.5 seconds each time. Rejected.
- **Play the Opening once and remove the curtain afterwards.** That would reintroduce the page-shoving the curtain fixes, on every later load. Rejected.
- **The platform's page "rise" (a short `translateY` as the veil lifts).** This page pins sections with ScrollTrigger and positions elements fixed. A transform on an ancestor makes a fixed element position against that ancestor instead of the viewport, and the platform's own record explains why its rise ends with no transform left behind. Here the veil fading is what lets the page through, which is the only difference from the platform's version. Rejected.
- **Reuse the short curtain's `MAX_MS` (3.8s) as the escape.** It would cut the lockup off before it had held 3.5 seconds on a slow page. The Opening has its own escape, 8 seconds, which is later than the hold and shorter than the platform's 12 because a stalled marketing page is a reader leaving.

## Evidence

- `lib/boot.test.ts`: 24 tests (9 existed). The head script is run against stubbed browser globals, not read as text. New cases: plays on the first load and says so; does not play on a later load of the same session; the flag is written at the start; `?opening=1` replays; `?opening=11` and `?xopening=1` do not; blocked storage plays nothing and the short curtain still runs; the signup cover wins and does not spend the session's one play; the hold is not shortened by a warm load; ends as soon as the page is ready after the hold; both attributes come back off and the node is never removed; lifts without `load`; reduced motion is a shorter, different animation.
- Four mutations on the real file, each failing exactly the guard it should: flag never written, hold replaced by the short minimum, escape replaced by the short maximum, `data-opening` left behind.
- Rendered against `next build && next start` on localhost with Chromium (`--no-proxy-server`): first load of `/` plays (`data-opening="1"` at 2.0s, gone by 5s); a reload gets the short curtain; `?opening=1` replays; a first load of `/terms` plays (any path); reduced motion carries `data-opening="reduced"`. Frames at 0.15s, 0.7s, 2.0s, 3.6s, 3.9s, 4.2s and 4.9s at 1440 and 390, and reduced motion at 1440, are on the `captures/opening` branch of this repository.
- On the 1440 run the push out began about 4.4 seconds in rather than 3.6: the curtain still waits for fonts and an idle frame after the hold, as it always has, and the desktop page does more at load. At 390 it began at 3.6. Both are "the later of the hold and the page being ready".

## What this does not decide

- **The hold.** 3.5 seconds is a starting point, one constant (`OPENING_HOLD_MS` in `lib/boot.ts`), to be judged on the preview.
- **Where else it plays.** raaydr.com only, as ruled. Public artist pages and the listener side are the platform's and are not touched.
- **Whether the later-load curtain should be retired.** It still does the job it was built for. That is a separate decision.
- **Web vitals.** The lockup covers the page for at least 3.5 seconds on the first load of a session. Not measured.

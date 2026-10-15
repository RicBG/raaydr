# /li and /em join the tracking paths

- **Date:** 15 October 2026
- **Status:** Accepted. Ric approved it on 15 October at 11:51 ("add them"), board row 3377, answering question 1 of row 3259.
- **Related:** `2026-10-14-short-paths-render-the-homepage-so-each-is-counted.md`; `lib/trackingPaths.ts`; `app/li`, `app/em`.

## Decision

`raaydr.com/li` (LinkedIn: Ric's posts and the RAAYDR page) and `raaydr.com/em` (email sends, starting with the waitlist "bring one artist" email) work exactly like `/tt`, `/ig`, `/th`, `/fb` and `/dm`: each renders the homepage at its own address, keeps any query string, is `noindex, follow` with a canonical of `/`, and the nav treats it as the homepage.

## Why

Vegeta's channel plan (row 3259) ranks Ric's LinkedIn posts and the waitlist share email among the channels to run, and neither could be counted for free without its own path. Vercel Web Analytics on this plan reads `requestPath` but not UTMs, so a path per channel is the only free measure.

## Nothing else changed

No new visual and no new mechanism. The test that pins the list now expects seven paths, and the existing guard that every two letter folder under `app/` is a listed path covers the two new folders.

# The 1,000 stream rule post goes out without a hero image, and a post without one shares the site card

- **Date:** 15 October 2026
- **Decided by:** Ric approved EVE's page 1 on board row 3274 ("Yes to all"); built by `claude-deuce` from row 3263
- **Related:** board rows 3263, 3274, 3285; `content/pulse/spotify-1000-stream-rule.md`, `lib/pulse.ts`, `app/pulse/[slug]/page.tsx`
- **Status:** DECIDED
- **About:** EVE's first search page is a Pulse post at /pulse/spotify-1000-stream-rule; a post with no heroImage now points its share card and BlogPosting image at /og.png.

## The decision

EVE's drafted post is published as written in row 3263, with a closing note in the same shape as the other money posts (sources, the rule can change, RAAYDR has not launched to listeners so the RAAYDR section describes the published model). It ships without a hero image. `shareImage()` in `lib/pulse.ts` returns the hero when there is one and `/og.png` when there is not, and the post page uses it for Open Graph, Twitter and the BlogPosting `image`.

## Context

EVE ranked this the fastest search win: it rides the June 2026 Kratter v Spotify lawsuit and lands on why RAAYDR exists. No hero image exists, and agents cannot make one. Before this change an empty `heroImage` became `og:image` of nothing and a BlogPosting image of `https://raaydr.com` itself.

## Options rejected

- **Waiting for a hero.** The post's value is that the story is live now. The card page and post page already render without one; only the share metadata was wrong.
- **Reusing another post's hero.** It would show the wrong picture on every share of both posts.

## Evidence

- `lib/pulse.test.ts`: the fallback, the post loads with 5 FAQ entries and its note, no dashes.
- `next build && next start`, then Chromium at 1440 and 390: the post renders, no horizontal scroll, `og:image` is `https://raaydr.com/og.png`, and `/sitemap.xml` lists it.

## What this does not decide

- **The facts EVE flagged** are as in row 3263: the $40 million is Spotify's figure (some filings say $47 million); the 50 unique listeners figure and the $10 per track fine are left out on purpose. Nobody has reread Billboard or MBW from here.
- **The RAAYDR section** says only what the site already says (no threshold, monthly through Stripe once a balance passes £25). It does not claim an unpaid balance never expires.
- A hero image can be added later by setting `heroImage` in the frontmatter.

# Five short paths render the homepage at their own address, so each is counted for free

- **Date:** 14 October 2026
- **Decided by:** Riz (`claude-chat`) on board row 3212, answering Vegeta's row 3210. Built by `claude-deuce`.
- **Related:** this pull request; `lib/trackingPaths.ts`; `app/tt`, `app/ig`, `app/th`, `app/fb`, `app/dm`.
- **Status:** DECIDED. Counts in Vercel are to be confirmed on the deployed site once a real visit lands, see Evidence.

## The decision

`raaydr.com/tt` (TikTok bio), `/ig` (Instagram bio), `/th` (Threads), `/fb` (Facebook) and `/dm` (reel comment for link DMs) each render the homepage, unchanged, at that address. Any query string stays on the address. Each page carries `noindex, follow` and a canonical of `/`, so search sees one homepage, not six. The nav's waitlist button treats these paths as the homepage and scrolls in page, as it does on `/`.

## Context

Vegeta's 30 day read on row 3210 found no TikTok referrer at all, which cannot prove zero: TikTok's in app browser often strips the referrer, so a TikTok visit lands in "direct". The usual fix, `?utm_source=tiktok`, cannot be read on this plan: Vercel answered `402 payment_required: UTM dimensions require an Enterprise plan or the Web Analytics Plus add-on`. Vercel does break visits down by path at no cost, so a distinct path per channel gives the same answer for nothing.

## Options rejected

- **A redirect from `/tt` to `/`.** Vercel Web Analytics counts in the browser: the `<Analytics />` script reports the page it is running on. After a redirect that is `/`, so the channel is lost, which is the whole point. The brief allowed either and asked for whichever is actually recorded; the redirect is not.
- **A rewrite in `next.config.ts`.** It would likely keep `/tt` in the address bar, but Next documents hydration mismatches when a statically rendered page reads its pathname behind a rewrite, and the nav does read it. Five two line route files are plainer and cannot disagree with themselves.
- **One dynamic `app/[short]/page.tsx`.** A catch at the top level of the site to save four tiny files. Not worth the risk to every other one segment address.
- **Paying for Web Analytics Plus.** Out of scope: nothing paid.

## Evidence

- `next build` lists `/tt`, `/ig`, `/th`, `/fb` and `/dm` as static pages.
- Against `next build && next start` on localhost, Chromium with `--no-proxy-server`, at 1440 and 390 wide, each path: stays at its own address with the query string kept (`/tt?utm_source=tiktok`); queues exactly one Vercel pageview, `["pageview",{"route":"/tt","path":"/tt"}]` and likewise for the other four, against `"/"` for the homepage; records `landing_path` as the short path in the session attribution, so a waitlist signup that started there says so; renders the homepage hero; the nav button is `#waitlist`; no sideways scroll.
- Served HTML on `/tt`: `<meta name="robots" content="noindex, follow"/>` and `<link rel="canonical" href="https://raaydr.com"/>`.
- `lib/trackingPaths.test.ts`: the five paths, each route file re exports the homepage and the metadata, no stray two letter route folder outside the list, the metadata itself, and the homepage check (including that `constructor` is not mistaken for a path, a fault caught while writing it).
- **Not proven here:** a hit showing in the Vercel dashboard. The analytics endpoint exists only on Vercel and this container cannot reach a Vercel host, so the proof stops at the pageview the script is handed. Vegeta's next read is the check.

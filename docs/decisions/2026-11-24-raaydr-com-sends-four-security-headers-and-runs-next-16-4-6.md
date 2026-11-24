# raaydr.com sends four security headers and runs Next 16.4.6

- **Date:** 24 November 2026
- **Decided by:** `claude-chat` (Riz), board row 6610, acting on the findings of `claude-raph`'s security sweep (rows 6606 and 6607) and Ric's standing order to get launch work merged
- **Related:** `ops.handoff` rows 6606, 6607, 6610, 6615, 6618; `RicBG/raaydr-platform` PRs #1085 (headers) and #1086 (Next bump), which did the same for the app
- **Status:** DECIDED

## The decision

Every response from raaydr.com now carries four headers: `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. And `next` is **16.4.6**, up from 16.2.10, with `eslint-config-next` moved to the same version because the two ship together. The removed `experimental.viewTransition` flag is deleted from `next.config.ts`.

## Context

Raph proved on 24 November that the live app could be put inside another site's iframe, which is clickjacking. Riz ordered the same four headers on this site and a `next` bump to "at least 16.4.6" on row 6610, because 16.2.10 was behind published critical advisories. Row 6618 listed both as still owed by `claude-deuce` after the platform's equivalents were done.

**Measured before the change, against the live site:** `https://raaydr.com/` answered 200 with only `content-type` and `server: Vercel`. None of the four headers was present. A page on another origin containing `<iframe src="https://raaydr.com/">` loaded it: the frame's URL was `https://raaydr.com/`.

`npm audit --omit=dev` before: **6 vulnerabilities, 1 critical** (`next`), 4 high, 1 moderate.

## What the bump involved

The release notes for every tag from 16.2.11 to 16.4.6 were read (via the web-fetch agent) for anything labelled breaking, deprecated or removed, and for next/image, `headers()`, Turbopack and React requirements. **No release is labelled BREAKING.** Two items mattered here:

1. **`experimental.viewTransition` was removed in 16.3.0 as an inert flag**, and Next's own bundled docs now say view transitions work in the App Router "with no configuration". This site set the flag, and `components/RouteTransition.tsx` documents it as necessary. **Left in, it fails the build**: `Object literal may only specify known properties, and 'viewTransition' does not exist in type 'ExperimentalConfig'`, plus an "Unrecognized key" warning. It is deleted. Whether the page transitions still run without it was measured, not assumed: see Evidence.
2. **The image optimiser fixes are the reason for the version.** This site serves AVIF and WebP through `next/image`. The advisories fixed between 16.2.10 and 16.4.6 include unauthenticated RCE through the AVIF path (16.3.3) and the SVG path (16.4.1), and a bypass of the SVG rejection (16.4.5, GHSA-7qx7-33qx-rqx2). Stopping at an earlier 16.4.x would have left the second of those open. The release notes mention re-enabling AVIF optimisation (16.3.4 and 16.4.0) and never say what was switched off; that it was turned off in 16.3.3 as part of the RCE fix is an inference, not a quotation. The config still lists `image/avif` first and the build is unchanged.

`react` and `react-dom` stay at 19.2.4 (read off the lockfile diff); 16.4.6 accepts `^19.0.0`. The lockfile moves `next`, its platform `@next/swc-*` entries, two `sharp` WebAssembly variants and a `postcss` copy under `vite` (a dev dependency), and nothing else.

## Options rejected

- **A full Content-Security-Policy.** Row 6610: "Don't do a full CSP." A policy that is only half right breaks the page for a visitor before anyone here notices, and `frame-ancestors` alone closes the finding.
- **Only `X-Frame-Options`, or only `frame-ancestors`.** One is for old browsers and one is the current standard; sending both costs nothing and the platform sends both.
- **Stopping at 16.4.x below 16.4.6.** The advisory list above puts the last SVG bypass in 16.4.5; 16.4.6 is the newest 16.x on npm.
- **Keeping the `viewTransition` flag behind a cast.** It would compile and do nothing, which is the "looks configured, is not" shape this repository's records warn about.

## Evidence

All against a production build of this branch (`next build` then `next start`), Chromium with `--no-proxy-server`:

- **Headers:** `curl -I` on `/`, `/help`, `/terms` and a missing path under `/_next/static` each returned all four headers, with the right values. The 404 carries them too.
- **Framing is refused.** A page on another origin framing the patched build ended with the frame's URL at `chrome-error://chromewebdata/`. **Control:** the same test against the live raaydr.com, which has no headers yet, loaded the frame normally. The two results differ only by this change.
- **Route transitions still run without the flag.** `document.startViewTransition` was wrapped before load. After the first load it had been called once (the opening). A client-side click from the home page to `/for-listeners` took it to **3**: two more calls on one navigation. No page errors.
- `npx tsc --noEmit` clean; the production build compiles and prerenders every route; `npm test`: 19 files, 250 tests pass, five of them new (`lib/securityHeaders.test.ts`).
- `npm audit --omit=dev` after: **2 vulnerabilities (1 moderate, 1 high), none critical.** The two left are `baseline-browser-mapping` and `source-map-js`, indirect, with `npm audit fix` available. Not touched.
- `npm run lint` reports 10 problems (7 errors, 3 warnings), **identical to the unchanged baseline**: the same files and the same `react-hooks/set-state-in-effect` findings, checked by linting a clean checkout of the parent commit. They are not from this change and are not fixed here.

## What this does not decide

- **The live headers are not yet proven on the real site.** A preview deployment is behind Vercel's login, so the `curl` proof against raaydr.com has to wait for the merge and its production deploy. That check is the same four lines of `curl -I` and belongs on the board when it is done.
- **The two remaining indirect advisories**, and the pre-existing lint errors, are separate work.
- **Whether the visual result is unchanged.** The transition was measured by call count, not by eye. Riz wants the Next bump looked at before it ships (row 6626), and that is hers.

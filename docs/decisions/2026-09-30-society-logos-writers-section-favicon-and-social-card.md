# Society logos behind a flag, the writers section, the wave-mark icon and a generated social card

- **Date:** 30 September 2026
- **Decided by:** Ric (designs signed off 17:17, "perfect"); `claude-chat` (the brief, board rows 2220, 2222, 2223); `claude-deuce` (this build)
- **Related:** `work_items` 256 and 257; the design canvas `claude.ai/artifact/DbPCBy7gN2oNKHK4QYdULk`
- **Status:** DECIDED, awaiting Ric's yes on the preview before merge
- **About:** two new homepage pieces, the site's icon set, its social card, and one line of hero copy.

## The decision

1. **`SocietyLogoRow`** sits directly under the hero and **`WritersSocietySection`** sits after the calculator (`RealNumbers`) and before `FindYourPlace`. Both are drawn from the `Homepage` and `Lower` boards.
2. **The logos are behind a flag that is off in production** (`lib/societies.ts`). Showing a society's logo implies a relationship RAAYDR does not yet have with most of them. Ric turns it on himself.
3. **The icon is the app's own four-bar mark** on the cream tile, replacing the "R.", on this site. The platform's icon is a separate small pull request on `raaydr-platform`.
4. **The social card is code**, `app/opengraph-image.tsx` and `app/twitter-image.tsx`, 1200 by 630, replacing `public/og.png`.
5. **The hero line reads "Attention pays."** It said "Attention over streams."

## What building it decided that the brief did not

- **The flag needs no Vercel setting.** `SHOW_SOCIETY_LOGOS=true` or `false` wins anywhere. With neither set it follows the deployment: on when `VERCEL_ENV` is `preview`, off otherwise. So the preview shows the logos for Ric to approve, production does not, and nothing in the hosting configuration had to be changed to make that so. The homepage is prerendered, so the answer is fixed per build, which is the right grain: a preview build is on, the production build is off. Turning it on in production later is one environment variable and a redeploy.
- **With the flag off, the writers section still ships its wording** and drops only the logo panel, so the text does not sit alone in a half-empty twelve column grid: it takes seven columns. Riz ruled the wording alone is fine to go live whenever Ric says.
- **The social card's fonts are the site's own, converted.** The renderer behind `ImageResponse` reads ttf, otf and woff but not woff2, and the site ships woff2 only. `assets/og` holds woff copies of Clash Display Semibold, General Sans Medium and Space Mono Regular, made from the shipped files with `fonttools`. The canvas board used stand-in faces; its layout is followed, its typefaces are not.
- **Every page states its own share image**, because App Router metadata merges shallowly (see `lib/seo.ts`). So the file convention alone would not have reached any page. `lib/seo.ts` now points at `/opengraph-image` and `/twitter-image`.
- **The 512 master is committed as `public/icon-512.png`** for the platform's manifest. This site has none.
- **`favicon.ico` is built from the 16, 32 and 48 pixel PNGs** as PNG frames. The old `app/icon.png` is removed so Next does not serve two.
- **The first favicon set was superseded by row 2222.** Those bars were chunky and bottom-aligned. These files are the app's real mark, geometry lifted from the live app logo.

## Options rejected

- **A Vercel environment variable set on Preview only,** as row 2223 suggests. It would have worked, but it is a change to the hosting configuration that nothing in the repository records, and the default above gives the same result without it.
- **Keeping `public/og.png` and regenerating it.** A file in `public` is what had already drifted from the brand.

## Evidence

Next build passes (`/opengraph-image`, `/twitter-image`, `/icon.svg` and `/apple-icon.png` are all emitted). The card was rendered to a PNG and read; the writers section and the logo row were screenshotted at 1440 and 390 from a preview-mode build. Lint and typecheck are clean on the new files; 127 tests pass.

## What this does not decide

- **Turning the logos on in production.** That is Ric's.
- **Whether the society names may be used at all.** The flag exists because nobody has asked them.

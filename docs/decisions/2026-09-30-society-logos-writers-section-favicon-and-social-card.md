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

## After review (Riz, board row 2245): the logo row was hidden, and now lives inside the pinned hero

**The first build put the row after the hero wrapper, and the next section covered it.** The hero is `position: sticky` inside a 200svh wrapper, and the Problem card is pulled up over that wrapper's second viewport with `margin-top: -100svh` so it scrolls over the hero. Riz measured it at 1440: the row rendered at y=1800, 215px tall, opacity 1, while Problem ran from y=1115 to 2049 and painted over it. In the DOM and invisible on the page. I had verified the row on an isolated test page and said so as not proven in situ; this is the thing that caveat was about.

**The fix puts the row inside the sticky hero, at the foot of its visible viewport** (`Hero` takes a `footer` slot; `SocietyLogoRow` has an `inHero` variant: transparent, compact, absolutely positioned at the bottom). It sits outside `.content`, so the recede animation does not scale or blur it, and it leaves with the hero when the Problem card scrolls over it, which is what "under the hero" meant.

**Measured on a production build with `SHOW_SOCIETY_LOGOS=true`, at the row's scroll position rather than a full-page capture** (a full-page capture flattens the pin): at 1440x900 the row is at y=797 to 900 with the button ending at 579 and the heading at 460; at 390x844 it is at y=721 to 844 with the button ending at 603. Seven logos, none overlapping. On a phone the hero version clamps each logo to 30px, because the per-logo optical heights are inline and the tall marks (BMI, SIAE) otherwise overflowed their slot onto their neighbours.

**One honest limit: the cookie bar covers it on a first visit.** The consent bar is fixed to the bottom of the viewport, 111px tall at 1440 and 226px at 390, exactly where the row sits, so a first-time visitor sees the row once they have chosen Accept or Reject. Captured both ways. Moving the row above the bar would put it on top of the orb on a phone; that is a design call for Ric and is not made here.

## After Ric (board row 2259, 19:28): the row needed to breathe

Ric: *"more space top and bottom between the sphere and the logo banner, and also under the logo banner... just to make it breathe."* The row sat 7px under the sphere's bottom edge at 1440 and 28px above the viewport foot.

**What changed, and why the orb moved instead of the row.** The row is pinned to the foot of the hero, so the only way to gain space above it is to give the orb less. With a footer present (`data-footer` on the hero), the orb's size is capped at `min(52vw, (100svh - 261px) / 0.81)` (0.81 is the visible circle's share of its box) and its top follows the size so the circle starts just under the nav; the heading, which shares both variables, stays centred in it. The row's bottom padding went from 28px to 56px at 1440 and from 20px to 44px on a phone. On a phone the orb's centre moves up by 36px.

**Measured at the row's scroll position on a production build:** at 1440x900 the row is at y=769 to 900, about 90px under the sphere and about 55px above the viewport foot; at 390x844 it is at y=697 to 844, about 50px under the sphere. **One side effect to know about:** the smaller orb makes the heading wrap to four lines at 1440 (it was three); it still sits inside the sphere with the button below. The cookie bar still covers the row until a first visit choice, and on a phone it is now 226px tall against a row that starts 147px up, so it covers a little more of the orb's foot too. Not changed.

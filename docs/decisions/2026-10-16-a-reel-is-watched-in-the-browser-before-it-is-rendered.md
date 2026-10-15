# A reel is watched in the browser, at its real size, before anything is rendered

- **Date:** 16 October 2026
- **Decided by:** Ric, "Yes" at 00:06 on board row 3539, to Riz's brief; built by `claude-bumblebee`
- **Related:** board rows 3207, 3308, 3360, 3361, 3539; `app/preview/reels/sat-17/page.tsx`, `components/reels/`, `lib/reels/sat-17.ts`
- **Status:** DECIDED

## The decision

The Sat 17 October reel, "Things nobody tells you about buying streams", exists first as a page
on this site at `/preview/reels/sat-17`: a 1080x1920 stage that plays the reel in the browser,
timed as the real thing, built from the site's own fonts, colours, wordmark file, four-bar mark
geometry and the artists' halo loop. Ric watches it on his phone, says what to change, and only
after his sign off is an MP4 rendered. **No MP4 is made before that**, and the preview is not a
page of the site: `robots` is noindex, it is absent from `app/sitemap.ts`, and the site's nav,
footer and grain are taken off it.

The copy is row 3308's Sat 17 line word for word, and `lib/reels/sat-17.test.ts` fails if it
drifts, if a dash or a banned cohort word appears, or if the Pulse post the DM points at stops
making the claims the cards make.

## Context

The 14 day reel plan (rows 3207 and 3308) was approved as a table of text. Nobody had seen one
move. Ric's rule for everything visual is preview first, render on sign off, and a rendered file
is the expensive thing to change: a wrong word costs a re-render and a re-upload, a wrong word on
a page costs a commit.

The reel is also silent on purpose. Row 3360 attaches the music (One For Dilla, Otis McDonald)
from Instagram's licensed catalogue at scheduling, with the reel's own volume at zero, so the
rendered file carries no audio either. The page says so beside the stage rather than leaving a
reviewer to wonder.

## How it is built, and why that way

- **Every frame is a function of the clock.** The stage draws second `t` of the loop; nothing is a
  CSS animation with its own start time. Pausing holds a still, the scrubber shows any second,
  and a later render of the same component at the same `t` is the same picture. This is the
  deterministic engine rule the films were built on.
- **Motion follows the visual language file, v1.6 §7:** captions rise 26px out of a 10px blur,
  leave by rising 14px into a 6px blur, exits quicker than entrances, a spring on the mark, the
  wordmark wiping in 0.15s behind it, a slow camera push and a drifting glow so nothing is
  still.
- **The hero object is a real one.** The artists' halo loop from `/media`, the file the site
  already serves, cropped so the head and halo hold the lower half and the copy lands on clean
  canvas above it. The wordmark is the SVG file; the mark is the exact 24 grid geometry from
  `/logo/raaydr-mark-v3.svg` with only its bar heights breathing.
- **Light ground, not dark.** The reel sits on the site's canvas, with ink type, because that is
  what the halo loop is and what raaydr.com is. v1.6's `#08080A` room is the films' and the
  product's; the social template rule in its §10 is built on the site's own surfaces.
- **The page uses the page.** At 390 the stage takes the width with the controls under it; from
  900 the stage sits at its 9:16 height with the notes beside it, so a 1440 window is not a
  phone shape alone in the dark.
- **The site's opening curtain is respected.** `lib/boot.ts` plays a 3.5 second opening once per
  session on every route. The reel's clock waits for the `data-booting` attribute to leave
  `<html>` before it starts, otherwise the hook plays behind the curtain and the reviewer meets
  card two.

## Options rejected

- **Rendering an MP4 straight from the plan.** Ric's rule is preview first. A rendered file is
  the most expensive thing to change and the hardest to annotate from a phone.
- **A Canva or Instagram editor build.** Not reviewable from the board, not the real fonts, not
  the real mark geometry, and not something a test can read.
- **A dark `#08080A` stage.** The halo loop is a light piece; putting it on a dark ground would
  have meant a frame around it or a different asset, and the brief said real assets, never
  stand-ins.
- **Hiding the cookie banner on the preview.** The root layout loads GA and the Meta pixel on
  every route, so the banner is doing its job there too. One tap.

## Evidence

- `npx vitest run`: 14 files, 197 tests, all passing, including the five new reel guards.
- `next build && next start`, then Chromium at 390, 834 and 1440 with `--no-proxy-server`:
  header, footer and `.grain-overlay` all `display: none` on the route; no horizontal scroll;
  `<meta name="robots" content="noindex, nofollow, nocache">`; `/sitemap.xml` has no `preview`
  entry; the stage element hydrated (a `__reactFiber` property on the range input); frames at
  0.9s, 4.2s, 10.5s, 14.2s, 17.4s and 20.6s show the hook, cards one, three, four and five and
  the end card, each clear of the figure.
- Headless Chromium has no H.264, so the loop shows its poster there; the poster is a separate
  layer under the video for exactly that case, and on a phone the video fades up over it.

## What this does not decide

- Whether the other nine text reels get the same treatment. This is the first; the engine is
  general enough that each is a data file and a route, but that is Ric's call per reel.
- The music. It is Instagram's at scheduling, per row 3360, and nothing here plays it.
- Anything about posting. Nothing is scheduled, posted or sent by this change.

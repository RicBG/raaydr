# The About page drops its borrowed green rather than picking a fifth audience colour

- **Date:** 24 September 2026
- **Decided by:** `claude-deuce`, the component API choice left to me on board row 1375
  ("the smaller change and say why"), following Riz's confirmation that the colour
  question itself was already settled by the 25 August violet ruling
- **Related:** `components/AboutContent.tsx`, `components/PageSpectraNoise.tsx`,
  `components/AudiencePage.tsx`, `work_items` 149
- **Status:** DECIDED

## The decision

The About page's `PageSpectraNoise` noise band (tinted `audience="listeners"`, Signal
Green) is removed entirely rather than recoloured. The Hero Callout beneath it, which
carries its own separate `color` prop rather than deriving from `audience`, changes from
the hardcoded `#3BCE7B` to `#9B6BFF`, the site's actual brand violet.

## Context

`work_items` 149 (backlog, `kfgootvqcdnfdzzustyb`), raised while verifying `work_items`
122: `AboutContent.tsx`'s own comment said "Not audience-specific, so this page doesn't
have a natural colour — Signal Green (`--green`) is the site's own primary/action
colour, the closest thing to a neutral pick." That was true before 25 August 2026 and has
not been true since: `app/globals.css`'s own comment records "Ruled 25 Aug 2026, replacing
Signal Green" with `--brand: #9b6bff` as the site's actual action colour, and `--green` is
now scoped "listeners, and nothing else." About was rendering as if it were a page for
listeners specifically, which it is not.

Riz's board row 1375 ruled the colour question already settled by that August ruling and
left the API shape to whichever agent built it, on the condition that the smaller change
wins.

## Options rejected

- **Add a fifth entry to `PageSpectraNoise`'s `AUDIENCE_COLORS` map** (e.g. `'brand'`),
  keyed to `#9b6bff`. Rejected as the larger footprint: it touches a shared component's
  locked colour map (its own comment: "RAAYDR's locked spectrum colours") and its closed
  `RaaydrAudience` type, both consumed by every audience page, for the sake of one page
  that isn't an audience page at all.
- **Add a colour-override prop to `PageSpectraNoise`** bypassing the `AUDIENCE_COLORS`
  lookup. Same objection: widens a shared component's public API for a single call site.
- **Recolour the noise band to violet by hand**, outside the `AUDIENCE_COLORS` map (e.g. a
  raw hex passed some other way). Not possible without an API change, since the shader's
  colour uniforms are only ever set from `AUDIENCE_COLORS[audience]` today.
- **Leave the noise band and only fix the wording of the stale comment.** Would have kept
  the actual bug (a page rendering with a colour that means something specific — listeners
  — elsewhere on the site) while only correcting the explanation of it.

## Evidence

- `AudiencePage.tsx:64`, `halo?: RaaydrAudience`, is already optional, and its own comment
  says the page "skips the noise band entirely... with no audience to colour it" when
  absent. `AudiencePage.tsx:222`, `{halo && !calloutActive && (...)}`, confirms the band is
  never rendered with a fallback colour, only omitted. About now follows that existing,
  already-shipped precedent rather than inventing a new one.
- `HeroCallout.tsx`'s own doc comment: its `audience` prop is "only used to give the
  section a stable id for aria-labelledby." The actual colour is the separate `color`
  prop, already a raw hex string at every call site (`#3BCE7B` before this change). No
  type or API change was needed there.
- `about.module.css`'s `.noiseBg` class is also used by `app/terms/page.tsx` and
  `app/privacy/page.tsx`, confirmed by grep before touching the stylesheet, so the class
  itself was left in place; only `AboutContent.tsx`'s use of it was removed.
- `npm run lint`, `npm test` (121 passing) and `npm run build` all clean on this branch.
  The seven pre-existing lint errors in `RealNumbers.tsx` and `animated-gradient.tsx` are
  unrelated and untouched.

## What this does not decide

`app/terms/page.tsx` (`audience="tastemakers"`) and `app/privacy/page.tsx`
(`audience="producers"`) pick their own arbitrary audience colours for the same
not-really-an-audience reason About did, and neither is touched here. Unlike About's
comment, neither claims to be neutral, so there is no equivalent factual error to fix, only
an open design question: whether every non-audience page should share one treatment, or a
different role colour per page is fine as a stylistic choice. That is `work_items` 149's
own note on the backlog, not decided by this record.

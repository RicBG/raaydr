# The terms are published, and the word "interim" is not

- **Date:** 28 September 2026
- **Decided by:** wording proposed by `claude-code` on `ops.handoff` row 1797, signed off by `claude-chat` on row 1818 with one change, approved by Ric on row 1819; re-ranked to the top by Ric on row 1860
- **Related:** `app/terms/page.tsx`, `raaydr-terms-interim-v1.0.md` in Drive (`1vwvw8I7YIA2HpF354ku5c1b-yGfBrGpR`), board rows 1789, 1797, 1818, 1819, 1829, 1860, 1863; `RicBG/raaydr-platform` PR #294
- **Status:** DECIDED
- **About:** `/terms` has been a live route with a placeholder body since PR #70. It now carries the ten clauses that were checked against production, signed off and approved — and it deliberately does not carry the word "interim" anywhere a reader can see, because Ric ruled the public name is "Terms".

## The decision

`/terms` publishes the ten clauses from `raaydr-terms-interim-v1.0.md`, with the six
amendments approved on board rows 1818 and 1819, and a `Last updated 28 September 2026` line.
The word **"interim" appears nowhere a reader can see**, which overrides an instruction in the
source document.

## Context

RAAYDR's licence to stream an artist's music came from a Drive document marked PROPOSED and
from nothing that a person had ever agreed to. Board row 1789 raised the gap; row 1797
checked every clause against production and found the sharpest problem in clause 3, which
licensed RAAYDR to stream *"to RAAYDR subscribers"* when **there are no subscribers and never
have been**. `play_entitlement` has four doors to another artist's track and only one is a
subscription, so the licence as drafted authorised **none** of the 1,098 plays that had
actually happened — all of which were Ric's own, by `admin` or `comp_grant`.

The platform half shipped on 26 and 28 September: a terms tick at signup, acceptance
records, and `current_terms_version()`, all switched off until this page existed
(`raaydr-platform` #294, board row 1829).

**The page was reported as "NOT live" and it was live.** Board row 1860 said *"Item 1, /terms
on raaydr.com: NOT live. Still blocked on RicBG/raaydr being attached."* `app/terms/page.tsx`
had existed since PR #70, with correct metadata and the title already right. What was missing
was the **content** — the body said *"Full terms of service will be published here before Day
One memberships open."* So this was replacing a placeholder, not building a page, and the
attach only ever blocked the former. Recorded because the same class of error was found three
other times the same day (board row 1863).

## Options rejected

- **Keeping the visible "interim" label, which the source document requires.** The drafting
  note says *"The site version must carry the interim label visibly"*, and that instruction is
  eighteen days older than Ric's ruling on row 1819: the public name is **"Terms"**, never
  "interim". His ruling wins, and the honesty the label was carrying is kept in the lead
  paragraph instead — it says in its first sentence that fuller terms reviewed by a solicitor
  will replace these. **A label is not the only way to be honest about a document's status,
  and it was the way that made the page look provisional.** The version string stamped at
  signup is still `terms-interim-2026-09-v1`, which is internal; a test in the platform repo
  asserts it never reaches a reader.
- **"in every territory where RAAYDR is available"**, which is what row 1797 proposed as the
  smallest change. Rejected on row 1818 in favour of **"worldwide"**, accepting row 1797's own
  reservation: defining the licence's scope by our own availability is circular, so it grows
  silently when a country opens, and a solicitor would change it anyway.
- **`<h2>` per clause.** `about.module.css` styles no headings inside `.body`, so an `<h2>`
  would inherit whatever the global sheet does. Clause headings are inline `<strong>`, which
  is both the source document's own format and what `/privacy` already does.
- **Widening the legal pages to use the desktop width.** `.body` is `max-width: 62ch`, a
  reading measure with nothing beside it, shared with `/about` and `/privacy`. The platform
  repo's standing rule calls a narrow column on a wide screen a bug and names a deliberate
  reading width as its exception. Legal text is that exception, and **redesigning three legal
  pages is a different job from publishing wording** — doing it here would have widened a
  content change into a layout change nobody asked for. Raised rather than done.
- **Publishing the annex.** The source marks the wave-one artist consent note *"sent
  individually, not published"*. It stays unpublished.

## Evidence

`npm run build` compiled successfully and `/terms` prerenders as static. `npm test`, **121
tests in 8 files, all passing**. `npm run lint` reports 7 errors and 3 warnings, **all of them
pre-existing** in `JoinedModal`, `LiquidGradient`, `RaaydrOrb`, `ScrollRevealText`,
`FindYourPlace`, `RealNumbers` and `animated-gradient`; **none in `app/terms/page.tsx`**, and
the only file this change touches is that one.

**Checked against the built HTML rather than the source**, because what renders is the thing
that matters:

| checked in `.next/server/app/terms.html` | result |
| --- | --- |
| the word "interim" | **0 occurrences** |
| `Last updated 28 September 2026` | present |
| `RAAYDR LIMITED`, `17418893`, `66 Paul Street` | present |
| `worldwide` | present |
| `Made with AI` | present |
| the old placeholder (`waitlist mode`, `will be published here`) | **gone** |

## What this does not decide

- **The terms gate stays OFF.** `current_terms_version()` still returns nothing on production,
  so no signup requires a tick. Flipping it is Ric's: it reaches every new person and it is
  switching a gate on, both of which board row 1845 reserves for him. It should not be flipped
  until this page is merged and served, or people would agree to a page that has not changed
  yet.
- **A solicitor has not read these.** Wale sees the full set before listener subscriptions go
  on sale. The lead paragraph says so.
- **There is still no listener-facing term of any kind.** Row 1818 flags it and row 1797 lists
  what it leaves uncovered: listener data, Top listeners, Top 8 names, public playlists,
  messages, follows and gifted subscriptions. `/privacy` has not been reviewed since August.
  Both must happen before the first real listener.
- **Declaration v4 and the publishing fields** are items 3 and 4 of row 1860, in the platform
  repo's upload flow, and are not this change.
- **Whether our processors reserve training rights.** Clause 4 promises no third party uses the
  music for training. Nobody has checked the storage, transcoder and CDN terms; row 1818 sends
  it to Wale as an open item and says not to claim it is checked.

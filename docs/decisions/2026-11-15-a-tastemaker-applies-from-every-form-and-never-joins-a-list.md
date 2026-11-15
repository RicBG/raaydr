# A tastemaker applies from every form on the site and never joins a list

- **Date:** 15 November 2026
- **Decided by:** Ric, board row 6063 (12:12), bug-fix tier already ruled by #112 (board rows 5347, 5348). Built by `claude-deuce`.
- **Related:** #112 (`/tastemakers` becomes Apply to join), platform board rows 6051 and 6052
- **Status:** DECIDED, awaiting Riz's look at the preview and Riz's words for the hand-off line

## The decision

Pick **Tastemaker** on ANY waitlist form and the form does not collect a row. The questions and the submit button are replaced by one line and an **Apply to join** link to `applyUrl.tastemaker` (`app.raaydr.com/apply/tastemaker`, with the ruled UTMs, one constant in `siteConfig`). `onSubmit` also sends a tastemaker there before anything is validated or posted, so Enter on the keyboard cannot write a row either. The rule is in `lib/applyInstead.ts`, keyed on the role and not on the page.

## Context

Vanessa joined as a tastemaker at 19:51 on 14 November from `/for-listeners` (source `listeners-page`). That produced a waitlist row and an acknowledgement and **no application**, so Ric had nothing to review and no links to follow. #112 moved only `/tastemakers` to Apply; the shared `WaitlistForm` kept the Tastemaker pill on the homepage forms and the audience pages, so the same thing was possible from every other page. It had already happened once before, on `/tastemakers` itself on 11 November, before #112.

## What each form does today (board row 6052 asked)

`WaitlistForm` is drawn in four places: the homepage middle (`homepage-mid`), the homepage bottom (`homepage-bottom`) and twice in `AudiencePage` (hero and closing, for the audience pages). **All four offered the Tastemaker pill and wrote a waitlist row.** After this change none of them do.

## Artists

Unchanged, and on purpose. An artist on this form already files an application (`submitArtistApplication`, browser to the platform) whenever the platform variables are set, which is why every artist signup measured since 7 November produced both an application and an acknowledgement. Without those variables the form falls back to a plain waitlist row; production has them. Listeners stay on the waitlist (Ric, 29 October) and songwriter or producer has no application yet.

## Not changed, and said so

- **`/api/waitlist` still accepts `role: tastemaker`.** A visitor's browser holding the old page can still post one for as long as it stays open, and rejecting the role server side would turn that into an error on a form the visitor saw working. Closing it is a one-line change once the form is live.
- **Existing tastemaker waitlist rows are not touched** (18 of them; Riz is not asking for role changes on existing rows, row 6052).
- The words "Tastemakers apply instead of joining a list." are a proposal. Where the copy and the layout differ from what Ric wants, Riz says.

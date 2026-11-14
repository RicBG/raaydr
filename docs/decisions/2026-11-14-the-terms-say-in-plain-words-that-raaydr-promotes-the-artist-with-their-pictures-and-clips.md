# The terms say in plain words that RAAYDR promotes the artist with their pictures and clips

- **Date:** 2026-11-14
- **Decided by:** Ric, 14 November 2026 at 11:17, relayed by `claude-chat` on platform board row 5898. The wording of the clause is his, "plain and as is". `claude-deuce` placed it and bumped the version.
- **Related:** platform board rows 5898, 5896; `content/legal/terms.md`, `lib/legal.test.ts`; version 1.3 record `2026-10-29-the-terms-say-a-day-one-price-is-kept-for-good-through-a-return.md`; platform record `2026-10-29-terms-1-3-is-current-and-nobody-is-re-asked.md`
- **Status:** DECIDED. Not live until the database side of 1.4 is published and the version constant moves (see below)
- **About:** The artist terms gain an explicit "Promoting you" paragraph in the uploading section, saying RAAYDR may use an artist's name, pictures, artwork and clips of up to 60 seconds in its social posts and marketing, only to promote them, and the terms are now version 1.4.

## The decision

Section 4 of `content/legal/terms.md` gains a paragraph, **Promoting you**, directly after "What you let us do" and before "When it ends". Ric's wording, unchanged: RAAYDR may use the artist's name, profile pictures, artwork and short clips of their songs (up to 60 seconds) in RAAYDR's social media posts and marketing; only ever to promote them and their work on RAAYDR; credit and tag wherever possible; never sold or licensed to anyone else; and an artist who would rather not be featured emails help@raaydr.com and RAAYDR stops and takes down posts it controls within 7 days. The version line is now "Version 1.4. Last updated 14 November 2026."

## Context

The existing licence in section 4 already lets RAAYDR use "short excerpts, your name and your artwork to promote you and your music on RAAYDR and on RAAYDR's own social channels". Ric's point was that it is already how RAAYDR works and artists know it from outreach, so the terms should say it plainly, with the limits an artist would want to see (a time cap, credit, no resale, a way out). Nothing about practice changes.

## Options rejected

- **Editing 1.3 in place.** Same reason as 1.3: a numbered version must not change what it says without changing the number.
- **A forced re-accept screen for existing artists.** Riz's instruction on row 5898, and consistent with 1.3 (`ask_existing` false). The change adds transparency and an opt-out and takes nothing away. `claude-emma` sends a short heads-up email once it is live, which Ric approves.
- **Folding it into "What you let us do".** That paragraph is the licence grant; this one is the limits and the way out. Keeping them separate lets an artist find the opt-out.

## Evidence

- `lib/legal.test.ts` gains a test pinning the version line, each limit in the clause, and its position between "What you let us do" and "When it ends". The no-dashes, no-internal-words and no-waitlist guards still pass. 14 tests pass in the file.
- The clause contains no dashes and uses UK spelling.

## What this does not decide, and what has to happen next

- **THE VERSION IS NOT LIVE FOR SIGNUP UNTIL THE DATABASE AGREES.** `TERMS.version` in the platform repo is `2026-10-29-v1.3` and `handle_new_user` accepts only the current `terms_versions` row. Publishing 1.4 needs a migration (published inert with `ask_existing` false, then switched in the minute after the deploy carrying the new constant), exactly as for 1.3. **That is `claude-code`'s to write and apply. Neither Sonnet lane applies migrations.** Until then the page here says 1.4 while signup still records 1.3, which is harmless to a signup but should be said out loud.
- **Interaction with "When it ends".** That paragraph says the licence ends when a track is taken down or the account closes, and the new clause gives 7 days to take down posts RAAYDR controls after an opt-out. Posts already published are not recalled by either. This is the solicitor's to read, not an agent's: Ric's wording was kept exactly.
- Whether the privacy page should mention it. Not asked, not changed.

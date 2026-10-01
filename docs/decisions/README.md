# Decision records

**This directory was started on 18 September 2026**, on `claude-chat`'s ruling (board row
1105), after a change to the waitlist form had nowhere to put its reasoning. It is a copy
of the same file in `RicBG/raaydr-platform`, and the two are meant to stay the same: the
two repositories are one product, and a rule about how decisions are recorded that holds
in one of them holds in neither.

The code shows what was built. Almost nothing shows why, and why is the part that gets
lost. This directory is where it goes.

## Who these are for

Someone who has never spoken to either agent and was not in the room when the decision
was made. Not Ric, who was there. Not the agent who wrote the code, who will not be.

That means: name the thing before using its short name, say what was tried and rejected,
and quote the evidence rather than referring to it. If a record only makes sense to
someone who already knows the answer, it has not been written yet.

## When to write one

**No pull request merges without its decision record.** If a change only moves code
around, the record is three lines. If it changes what the platform does to a person, or
closes off an option somebody will otherwise reopen in six months, it is longer.

The record and the `ops.handoff` note reporting the work are **the same markdown, written
once.** See `CLAUDE.md`.

## Naming

`YYYY-MM-DD-short-slug.md`, dated the day the decision was made rather than the day it
was written up.

## Template

```markdown
# Title, as a statement of what was decided

- **Date:** the day it was decided
- **Decided by:** who actually made the call
- **Related:** PR, issue, migration, commit
- **Status:** DECIDED, or SUPERSEDED BY <record>

## The decision

One paragraph. What is now true that was not true before.

## Context

What was happening that made this need deciding. Include the thing that went wrong, if
something did, with dates and figures.

## Options rejected

Each one, and why it lost. This is the section that stops the decision being reopened
from scratch, so a rejected option with no reason attached is worse than no entry.

## Evidence

What was actually checked, and how. Log lines, row counts, test names, timestamps. Where
something could not be verified, say so and say why.

## What this does not decide

The edges. What is still open, and what would change the answer.
```

## Records

**This table listed `RicBG/raaydr-platform`'s own decision records, not this repository's,
for some time.** Copying the README brought its whole file, table included, rather than
just the header and template above it. Found and fixed 24 September 2026: none of this
repo's own records appeared in the inherited table at all. Corrected to list only this
repository's own records; `raaydr-platform`'s table is the one in its own copy of this file.

| Date | Record | About |
| --- | --- | --- |
| 2026-09-18 | [a-decorated-address-is-stripped-before-it-is-judged](2026-09-18-a-decorated-address-is-stripped-before-it-is-judged.md) | An address typed with a plus tag or mixed case is normalised before any check judges it. |
| 2026-09-18 | [every-audience-is-asked-its-name](2026-09-18-every-audience-is-asked-its-name.md) | The waitlist form gains a name field, for every audience, not only artists. |
| 2026-09-18 | [the-platform-sends-the-acknowledgement](2026-09-18-the-platform-sends-the-acknowledgement.md) | This site asks the platform to send the signup acknowledgement rather than sending its own. |
| 2026-09-24 | [tickets-were-never-a-launch-unlock](2026-09-24-tickets-were-never-a-launch-unlock.md) | The loyalty copy named merch and ticket discounts as unlocks. Only merch ships at launch. |
| 2026-09-24 | [about-drops-the-borrowed-green](2026-09-24-about-drops-the-borrowed-green.md) | The About page borrowed Signal Green as "neutral" before the 25 Aug violet ruling. The noise band is dropped rather than recoloured, following an existing precedent. |
| 2026-09-24 | [artists-drops-the-present-tense-split-claim](2026-09-24-artists-drops-the-present-tense-split-claim.md) | "Set the split when you upload the track" described a control that does not exist. Ric's ruled replacement, verbatim. |
| 2026-09-24 | [the-site-says-forever-and-means-it](2026-09-24-the-site-says-forever-and-means-it.md) | A Day One price is locked forever and survives a cancellation, so the site says so. Ric's 21:20 ruling, wording approved at 21:24. |
| 2026-09-28 | [the-terms-are-published-and-the-word-interim-is-not](2026-09-28-the-terms-are-published-and-the-word-interim-is-not.md) | `/terms` carries the ten approved clauses, and deliberately never shows the word "interim", because Ric ruled the public name is "Terms". |
| 2026-09-29 | [the-tastemaker-share-is-up-to-ten-percent](2026-09-29-the-tastemaker-share-is-up-to-ten-percent.md) | The tastemaker share falls from up to 15% to up to 10% and RAAYDR's rises to 35%. Every figure derived from it moves too: 97p a fan becomes 64p. |
| 2026-10-01 | [the-opening-plays-on-the-first-load-of-a-session](2026-10-01-the-opening-plays-on-the-first-load-of-a-session.md) | The first-load curtain plays the Opening on the first load of a session, 3.5 second hold, about 4.5 seconds in all whatever the page is doing, `?opening=1` replays it; every later load keeps the short curtain. |

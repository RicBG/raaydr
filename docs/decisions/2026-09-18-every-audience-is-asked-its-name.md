# Every audience is asked its name, not only artists

- **Date:** 18 September 2026
- **Decided by:** Ric, board rows 1093 and 1103. Column shape ruled by `claude-chat`.
- **Related:** PR #71, migration `20260918090000_waitlist_signups_name.sql`
- **Status:** DECIDED

## The decision

The waitlist form asks every role for a name. Listener, songwriter or producer and
tastemaker go from "email and role" to "name, email and role"; the artist path keeps the
five questions it already had. The answer is stored on a new nullable
`public.waitlist_signups.name`, separate from the existing `artist_name`.

The form refuses a blank name on all four paths. The API route stores it but does not
refuse without it, which is set out under **Options rejected**.

## Context

Ric, just after midnight on 18 September (board row 1093):

> *"are we not capturing name for the other audiences, for listener, producer songwriter
> and also tastemaker? If not, I think we should. We should just capture name. Name and
> email address for them."*

Only the artist form had ever asked anything beyond an address, and it asked for the name
an artist **releases under** rather than the person's. Of the 25 people who signed up on
17 September, **17 left no name at all**. What the waitlist held was a list of email
addresses with nothing to call anyone.

It became urgent rather than tidy on the same day, for two reasons. Ric reprioritised it
to the front of the queue on row 1103 because artist applications had opened and paid
advertising was going back on that morning, so the list was about to grow fastest. And
four per-role acknowledgement emails had just been signed off (rows 1098 and 1099) which
all open `Hi {name}`; without this, three of the four roles get `Hi,` on a message whose
whole purpose is to not read like a blast.

## Options rejected

**Reusing `artist_name`.** One column, no migration, and wrong. A person's name and the
name they release under are different facts about different things, and one artist row
legitimately carries both: "Herbie Sherman" and "Ariki" are the same signup. Folding them
together loses that the first time anyone looks, and `artist_name` already carries a
meaning that 25 rows depend on.

**Backfilling the existing rows.** There is nothing to backfill from. Ruled explicitly on
row 1103: existing rows stay null. That is also why the catch-up acknowledgement email to
the people who joined earlier (row 1100) opens `Hi,` rather than waiting on this.

**`create or replace` on `upsert_waitlist_signup`.** Replace only replaces an identical
signature, so with an extra parameter Postgres would have created a **second**,
thirteen-argument function beside the existing twelve-argument one, without erroring. The
site's calls would have kept resolving to whichever matched, and a call landing on the old
one would write null to `name` on every signup: the failure mode with no symptom. The
August migration that added `artist_name` records the same reasoning, and it is repeated
rather than referenced because the next person to add a column will be reading the file
rather than its history.

**Refusing a missing name in the API route.** The form requires one; the route does not,
exactly as it already treats `artist_name`. A visitor still holding a cached bundle from
before the deploy posts no name at all, and refusing them would turn every deploy into a
window in which real signups fail for a field their page never showed them. Role and email
are still refused, because a row missing either is not a signup at all, which is a
different thing from a worse one.

`claude-chat` ruled on 18 September (row 1105) that this stands **for now**, and should be
tightened to refuse a missing name no sooner than 48 hours after this is live on
production, by which time any cached bundle has rolled over.

**Two columns for the two homepage captures, or a second form.** Never considered
seriously, but worth closing: there are five placements of one component, so the question
is asked in one file and lands in one column whichever form somebody meets.

## Evidence

- **Before**: `waitlist_signups` had no general name column. Columns were email, role,
  source, five UTMs, referrer, landing_path, artist_name, genre. 176 rows, 0 named.
- **The function after the migration**: exactly one `upsert_waitlist_signup`, the
  thirteen-argument signature, ACL `{postgres=X/postgres,service_role=X/postgres}`. The
  execute lock down is re-applied after the drop from `public, anon, authenticated`,
  because a drop discards the ACL and a newly created function in `public` picks up
  Supabase's default privileges afresh.
- **The function body digested against the file**: `md5(prosrc)` on the live project is
  `610203345b3b2e93418b96641bf2f449`, which equals the body in the migration file. Hand
  applied and then digested, per the standing rule that retyping a function body is how
  two databases quietly come apart. Independently re-read by `claude-chat` on row 1105.
- **The function's behaviour, proved inside a transaction and rolled back**: a name lands
  trimmed, and a later submission carrying a blank name updates role and source without
  wiping it. Nothing was persisted; the table was unchanged afterwards.
- **The form, in a real browser**: production build (`next build && next start`, never
  `next dev`, whose HMR websocket cannot connect in that container so the page never
  hydrates), Chromium with `--no-proxy-server`, and a twenty-line local stand-in answering
  the RPC so the run wrote to no project and the payload could be read back exactly as
  sent. 32 checks, all passing: per role, the page hydrated, the field present and
  `required`, a blank name refused with the right sentence and **nothing sent**, then the
  trimmed name arriving at `upsert_waitlist_signup` with the right `p_role`.
- **The artist application path** run separately with the platform variables pointed at
  the same stand-in: `apply_to_raaydr` fires first carrying the name, then the waitlist
  write follows.
- **Layout** measured at 390, 768, 1024 and 1440: stacked on a phone, side by side from
  768 up, no horizontal overflow at any width.
- `tsc --noEmit` clean, `vitest` 100 passing. `eslint` reports 10 problems, all of them
  present on `main` with this branch stashed, none in a file this touches.

## What this does not decide

**Nothing is validated beyond being non-empty.** A name is whatever somebody types, capped
at 120 characters so a pasted paragraph cannot become a row nobody can read. Plenty of real
names break any rule tighter than that.

**The 169 people who joined earlier stay nameless.** They are reachable by the catch-up
email on row 1100, which is written for that and opens `Hi,`.

**Whether the route should eventually refuse a missing name** is open, and deliberately
so: see the 48 hour condition above.

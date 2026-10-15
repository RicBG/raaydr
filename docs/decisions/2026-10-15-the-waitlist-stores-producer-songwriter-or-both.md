# The waitlist stores which kind of creator a Songwriter or Producer is, as a sub type beside the role

- **Date:** 15 October 2026
- **Decided by:** Ric, 15 October at 11:43 and 11:57 (board rows 3376 and 3383: producers and songwriters are two audiences in the back end, one option on the site). The data shape was proposed by `claude-deuce` on row 3497 and built by `claude-code` as asked.
- **Related:** `supabase/migrations/20261015210000_waitlist_signups_creator_kind.sql`, `20261015210100_upsert_waitlist_signup_takes_creator_kind.sql`; the front end half is PR #95 and `docs/decisions/2026-10-15-the-waitlist-asks-producer-songwriter-or-both.md`; `lib/creatorKind.ts`, `app/api/waitlist/route.ts`
- **Status:** DECIDED, NOT APPLIED. The two migrations are in the repository and have been replayed and tested locally. They are applied to the waitlist project `kfgootvqcdnfdzzustyb` only with Ric present, which both rows ask for.
- **About:** `waitlist_signups` gains a nullable `creator_kind` column holding `producer`, `songwriter` or `both`, and `upsert_waitlist_signup` gains a fifteenth parameter `p_creator_kind` that fills it, latest answer wins, a blank never wipes a stored answer.

## The decision

The role stays the single value `songwriter_producer`. Beside it the table gains `creator_kind text`, nullable, constrained by the table to the three slugs the site offers. `upsert_waitlist_signup` takes `p_creator_kind text default null` as its last argument, so the fourteen argument call the deployed site makes today still resolves, and the fifteen argument call PR #95 makes lands the answer. The lock down is re-applied for the new signature: EXECUTE revoked from `public, anon, authenticated`, granted to `service_role`, which is the ACL the live function holds.

## Context

The site asks one question, "Songwriter or Producer", and the back end counts them as two audiences. With one role value there was nothing to count. Deuce built the one extra tap on PR #95 and asked for exactly this shape on row 3497: a nullable column, a check on the three values, a `p_creator_kind` parameter that overwrites only when non null. The route already sends `p_creator_kind` and, on PostgREST's PGRST202, retries without it, so the site can ship before the migration and the migration can land before the site, and in neither order is a signup lost.

The function body is the live one, read with `pg_get_functiondef` on 15 October (prosrc md5 `970c2e13f427445aee67e5201d1c6f52`, the same body as `20261003150100`), with the column added to the insert and the update list and nothing else touched. After the migration the body's md5 is `17137d71f989c3c8cd243eef57573bab`; that is the digest to read back after the apply.

## What the replay showed

Replayed onto a throwaway Postgres with Supabase's default function privileges set, then exercised: one function remains, with the fifteen argument signature and the ACL `{postgres=X/postgres,service_role=X/postgres}`, `anon` and `authenticated` refused; a fourteen argument call still resolves and stores a null; `' Producer '` is stored as `producer`; a later submission with a blank keeps `producer`; a later `both` replaces it; `drummer` is refused by the table and the row count does not move.

## Options rejected

**A new role slug per kind.** Everything that checks the role would break, and the count of "songwriters or producers" that already exists would split. Rejected on PR #95 and here.

**First touch wins, like the UTMs.** What somebody says they are is what they say today, like the name and the genre; a producer who now also writes should be able to say so. Latest answer wins, and only an answer counts.

**Checking the value in the route only.** The route does drop anything it does not recognise, but the Control Room will group by this column, and a hand written insert should not be able to put a sentence in it. The table holds the list too.

**One migration for the column and the function.** Split in two, as the country pair was, so each can be applied and reverted on its own.

## What is not done

- **Nothing is applied.** The apply is Ric present, through the connector, with the `drop` spliced and the `revoke` in its own call straight after the `create`, then the ACL and the md5 read back.
- **Nothing reads the column yet.** The Control Room count of producers against songwriters is a separate piece once the column holds answers.

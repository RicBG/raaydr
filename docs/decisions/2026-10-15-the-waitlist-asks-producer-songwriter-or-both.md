# The raaydr.com waitlist asks Producer, Songwriter or Both with one tap

- **Date:** 15 October 2026
- **Status:** Accepted by Ric on 15 October at 11:43 and 11:57, board rows 3376 and 3383. Front end half only.
- **Related:** `lib/creatorKind.ts`; `components/WaitlistForm.tsx`; `app/api/waitlist/route.ts`; row 3396.

## Decision

The role stays one option on the site, "Songwriter or Producer". Choosing it reveals "Which are you?" with Producer, Songwriter and Both. The answer is optional and is sent as `creator_kind`. The API passes it to `upsert_waitlist_signup` as `p_creator_kind`.

## Why

Ric: producers and songwriters are two audiences in the back end, one option on the front. Today `waitlist_signups.role` is the single value `songwriter_producer`, so nobody can tell them apart.

## Rejected

- **New role slugs.** Would break everything that checks the role.
- **Required answer.** One tap is a nudge, not a gate; a lost signup costs more than a missing sub type.

## What is not done

- **The database half is not here.** The waitlist project needs a column and a `p_creator_kind text` parameter on `upsert_waitlist_signup` (Codey, Ric present). Until then PostgREST answers PGRST202 and the route retries without it, so no signup is lost and the tap is not yet stored. Do not merge expecting stored answers before that migration.

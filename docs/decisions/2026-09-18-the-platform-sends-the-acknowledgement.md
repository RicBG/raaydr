# The platform sends the signup acknowledgement, and this site asks it to

- **Date:** 18 September 2026
- **Decided by:** Ric, board row 1096 (that it must exist at all) and `claude-chat`, board row 1127 (that the platform sends it)
- **Related:** `lib/signupAcknowledgement.ts`, `app/api/waitlist/route.ts`, board rows 1096, 1100, 1126, 1127, 1141. The platform half is `RicBG/raaydr-platform`, `apps/web/src/app/api/signup-acknowledgement/route.ts`, with the full record at `docs/decisions/2026-09-18-the-acknowledgement-and-the-ledger.md` there.
- **Status:** DECIDED

## The decision

After `/api/waitlist` has successfully written a signup, it asks the RAAYDR platform to
send that person their acknowledgement email, over HTTPS, authenticated by a shared
secret. **This site does not send the email itself**, and the call can never fail a
signup.

## Context

Ric signed up on production as a new artist on 18 September and walked the whole funnel
for the first time. It worked. What it exposed was that **169 people had joined the
waitlist and received nothing at all** (board row 1096). There was no acknowledgement
email of any kind, for any audience, and nobody had noticed because the people affected
have no way to tell us.

Four versions of the copy were then written and signed off by Ric one at a time, after
two earlier drafts were rejected for selling listeners the artist's story. That detail
matters to this decision: the copy is specific enough that having two copies of it is a
real risk rather than a theoretical one.

## Options rejected

**Send it from here.** This site already writes the row, already has the person's name
and role in hand, and could hold a Resend key. One fewer hop, one fewer secret, no
cross-repository coupling.

It lost on two grounds, both about the second sender rather than about the call:

- **Two copies of the templates would drift.** Ric approved four versions line by line,
  and any divergence between them would be invisible, because nobody reads both inboxes.
- **Two sending reputations.** Everything transactional leaves through the platform's
  Resend account on a warmed domain. A second sender needs its own domain warmed, and a
  spam complaint on either lands on a domain that also carries invites and password
  resets.

**Move the artist application through a server route so one hop could do everything.**
Rejected outright and recorded in `lib/artistApplication.ts` as well. `apply_to_raaydr`
caps applications per IP address, read from `cf-connecting-ip`. Behind a server route,
every application would arrive carrying this site's egress address, the cap would become
a count of everybody, and the twenty-first real applicant in any hour would be silently
dropped — on the day paid advertising sends the most traffic this form will ever see.

**Have the platform poll `waitlist_signups`.** It is on a different Supabase project with
RLS and no public policies, so the platform would need this project's service role key.
That is a far larger grant than one endpoint and one secret, to solve a problem that is
not about reading.

**Fire the request without awaiting it.** This is a serverless function: a promise still
running when the response is returned may simply be killed. The email would then arrive
or not depending on how fast the platform happened to answer, which is worse than either
outcome chosen deliberately. It is awaited, and `requestAcknowledgement` never throws.

## Evidence

- **The endpoint was exercised end to end** against `next build && next start` with a
  twenty-line PostgREST stand-in, so the run wrote to no project at all. No secret: 401.
  Wrong secret: 401, byte for byte identical. A one-character secret: 401 again, no crash
  on the length mismatch. Correct secret: 200, with the address folded and claimed. The
  same person again, capitalised differently: 200, `reason=already-acknowledged`, no
  second row.
- **The role map was found by that run, not by reading.** This site stores
  `songwriter_producer`; the platform's `user_roles` has only ever had
  `producer_songwriter`. The same two words in the opposite order, which looks correct in
  whichever file you happen to be reading. Sent unmapped, the endpoint refused it with a
  400. `lib/signupAcknowledgement.test.ts` now pins the translation for every slug this
  site can store.
- **The secret is never written down.** `grep` for it across the server log after the run:
  zero occurrences. A test reads the arguments of every `console` call in
  `lib/signupAcknowledgement.ts` by balancing brackets, and was proved red by adding a
  real leak to the refusal line.
- **`npx vitest run`**: 107 tests across 8 files, all passing. `npx tsc --noEmit` clean.

## What this does not decide

**Whether to send at all is not decided here.** The upsert above the call is an UPSERT, so
this fires again for somebody signing up a second time. The platform holds
`signup_acknowledgements` and refuses to thank an address twice (board row 1141), because
it is also where the backfill was sent from and is the only side that can know.

**An artist whose application stored but whose waitlist write failed gets nothing.** The
form already treats that as a non-error, deliberately: they have applied, and showing an
error would make them press the button again and send a second application. The
acknowledgement rides the waitlist write, so it is lost in the same gap that already
loses their UTM attribution. Worth knowing; not worth a second failure mode to fix.

**Nothing here is live until two variables are set.** `PLATFORM_APP_URL` and
`SIGNUP_NOTIFY_SECRET` on this project, and the same secret plus
`SUPABASE_SERVICE_ROLE_KEY` on `raaydr-platform-web`. Without them the call logs a warning
and returns, and every signup still saves.

# The site records the country of a sign-up as a code, and never the address

- **Date:** 3 October 2026
- **Decided by:** Ric, 3 October 09:12 (sign-ups open everywhere; where they come from tells him which country to license) and 15:55 (the `country` column on the tracker project is cleared), relayed by `claude-chat` on `ops.handoff` rows 2566, 2594 and 2603
- **Related:** `lib/signupCountry.ts`, `app/api/waitlist/route.ts`, `supabase/migrations/20261003150000_waitlist_signups_country.sql`, `20261003150100_upsert_waitlist_signup_takes_country.sql`; `work_items` 297
- **Status:** DECIDED
- **About:** A waitlist sign-up stores the two letter country code the edge reports, nullable, first touch wins, never the IP address and never back-filled; the code is safe to ship before the migrations.

## The decision

`waitlist_signups` gains a nullable `country` column holding an ISO 3166-1 alpha-2 code (two capital letters, enforced by
the table). The waitlist route reads Vercel's `x-vercel-ip-country`, and sends it to `upsert_waitlist_signup` as
`p_country` only when it is a well formed code. **No address is read for this, logged for this, or stored.** The 211
existing rows stay null, as ruled: nobody recorded where they came from.

## Context

Ric ruled on 3 October that anyone can sign up from anywhere, listeners included, and that the country people sign up from is
his signal to go and license that country. The table had no country column, so there was nothing to count. The app side
(`profiles.country`) is a field the person types; this is the connection's country, which is a different fact and is
labelled as one.

## Options rejected

**Store the IP and resolve it later.** Rejected on sight: an address is personal data, nothing needs it, and the only
question is the country.

**Read `x-forwarded-for` or another address header and resolve a country ourselves.** Rejected. It needs a lookup
service (another processor) and the leftmost forwarded address is the caller's to set on most hosts. The platform's
standing rule is that only a header the edge sets and refuses to accept from a client may be trusted, and that an absent one is
recorded as absent. Vercel sets this header itself.

**Back-fill the 211 rows.** Not possible. There is nothing to back-fill from.

**Last touch wins.** Rejected. Where somebody first signed up from is a fact about that visit, like the UTMs. Country follows them:
first touch wins, a later visit with no header does not blank it, and a null may be filled the first time that person signs up
again.

**One migration for the column and the function.** Split in two, so each can be applied and reverted separately. Ric's
clearance names the column.

## Evidence

- `lib/signupCountry.test.ts`, 7 tests: a code is read, normalised, and anything not exactly two letters is null; no
  address header is read by the country path; the route sends `p_country` only when present and steps back on `PGRST202`.
- **A scratch Postgres 16**, with the repo's earlier migrations replayed and the table created beneath them (it predates
  the repo's migrations): the function body in the repo reproduces the **live** one exactly (prosrc md5
  `610203345b3b2e93418b96641bf2f449`, read from `kfgootvqcdnfdzzustyb` on 3 October); then both new files apply and 10
  assertions pass: an old thirteen argument call still resolves and stores null; a new call stores the code in upper case;
  first touch wins; a null does not blank; a null is filled; the table refuses a sentence; exactly one function of that name
  (so PostgREST sees no ambiguity); `service_role` can execute it and `anon` and `authenticated` cannot.
- **Mutation proven:** replacing first-touch with `excluded.country` fails assertion 3.
- **Not checked:** the header itself on the live site. That is a forgery test against a deployed URL, which this agent
  cannot reach; it is `claude-chat`'s, run once this is live (row 2603). Until then "Vercel overwrites the header" is a
  documented assumption.

## The order it ships in, and why it is safe in any order

1. This pull request merges (a merge to `main` is raaydr.com production). **Safe first:** until the function takes
   `p_country`, the route's first call fails with `PGRST202`, logs `country migration not applied`, and retries without it.
   The sign-up lands. Nothing breaks and nothing is stored.
2. The column migration is applied to the tracker project.
3. The function migration is applied. From then on new sign-ups carry a country.

## What this does not decide

- The privacy policy line ("Your approximate country, from your connection when you sign up..."): after #84 merges, drafted by
  `claude-chat`, ruled by Ric, because it changes published terms.
- Whether the route's existing forwarding of the visitor's address to Meta's Conversions API (consent gated) is right. Raised
  on the board, not changed here.
- The Control Room view and the licence alert, which are `raaydr-platform` work and follow.

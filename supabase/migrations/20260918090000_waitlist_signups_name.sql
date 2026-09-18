-- A name for every audience on waitlist_signups.
--
-- Ruled by Ric, 18 September 2026, board rows 1093 and 1103: "are we not
-- capturing name for the other audiences, for listener, producer songwriter
-- and also tastemaker? If not, I think we should."
--
-- Of the 25 people who signed up on 17 September, 17 left no name at all,
-- because only the artist form ever asked one. What Ric had was a list of
-- email addresses and nothing to call anyone, which is also what stops the
-- per-role acknowledgement emails (board rows 1098 and 1099) from opening
-- "Hi {name}" for three of the four roles.
--
-- A NEW COLUMN RATHER THAN REUSING artist_name, deliberately. A person's name
-- and the name they release under are different facts about different things:
-- one artist row can legitimately carry "Herbie Sherman" and "Ariki" at once,
-- and folding them together would lose that the moment anyone looked.
--
-- Same two-part shape as the two migrations before it, and for the same
-- reason: signups never touch the table directly, they go through the
-- upsert_waitlist_signup RPC. Adding a column without changing the function
-- would leave it null forever, silently.

-- 1. The column.
--
-- Nullable, and nothing is backfilled. The existing rows keep nulls, which is
-- the honest value: nobody was asked. Ruled explicitly on row 1103 — "existing
-- rows stay null, no backfill" — and there is nothing to backfill FROM. The
-- catch-up acknowledgement email for those people (row 1100) opens "Hi,"
-- exactly because of this.

alter table public.waitlist_signups
  add column if not exists name text;

-- 2. The function.
--
-- DROP then CREATE, not CREATE OR REPLACE, for the reason written out at
-- length in 20260824120000: replace only replaces an IDENTICAL signature, so
-- with an extra parameter it would leave the old twelve-argument function in
-- place beside this one. PostgREST would keep resolving the site's calls to
-- whichever matched, and a call that landed on the old one would write null to
-- name on every signup — the failure mode with no symptom.
--
-- p_name goes LAST and defaults to null, so a twelve-argument call from the
-- currently deployed site still resolves here. This migration is therefore
-- safe to apply before the code that fills the field, which is the order it
-- was applied in.

drop function if exists public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text
);

create function public.upsert_waitlist_signup(
  p_email        text,
  p_role         text,
  p_source       text,
  p_utm_source   text default null,
  p_utm_medium   text default null,
  p_utm_campaign text default null,
  p_utm_content  text default null,
  p_utm_term     text default null,
  p_referrer     text default null,
  p_landing_path text default null,
  p_artist_name  text default null,
  p_genre        text default null,
  p_name         text default null
)
returns void
language sql
set search_path to ''
as $function$
  insert into public.waitlist_signups (
    email, role, source,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer, landing_path,
    artist_name, genre, name
  )
  values (
    lower(trim(p_email)),
    p_role,
    coalesce(nullif(trim(p_source), ''), 'unknown'),
    nullif(trim(p_utm_source), ''),
    nullif(trim(p_utm_medium), ''),
    nullif(trim(p_utm_campaign), ''),
    nullif(trim(p_utm_content), ''),
    nullif(trim(p_utm_term), ''),
    nullif(trim(p_referrer), ''),
    nullif(trim(p_landing_path), ''),
    nullif(trim(p_artist_name), ''),
    nullif(trim(p_genre), ''),
    nullif(trim(p_name), '')
  )
  on conflict (lower(email))
  do update set
    role       = excluded.role,
    source     = excluded.source,
    updated_at = now(),
    -- First touch wins on the row, exactly as it does in the session. An
    -- existing non-null attribution is never overwritten: someone who first
    -- arrived from a campaign and later returns direct was still acquired by
    -- that campaign, and letting the second visit blank it would quietly
    -- destroy the only record of it. coalesce, deliberately in this order.
    utm_source   = coalesce(public.waitlist_signups.utm_source,   excluded.utm_source),
    utm_medium   = coalesce(public.waitlist_signups.utm_medium,   excluded.utm_medium),
    utm_campaign = coalesce(public.waitlist_signups.utm_campaign, excluded.utm_campaign),
    utm_content  = coalesce(public.waitlist_signups.utm_content,  excluded.utm_content),
    utm_term     = coalesce(public.waitlist_signups.utm_term,     excluded.utm_term),
    referrer     = coalesce(public.waitlist_signups.referrer,     excluded.referrer),
    landing_path = coalesce(public.waitlist_signups.landing_path, excluded.landing_path),
    -- Latest answer wins, but only when there is one. The opposite order to the
    -- UTMs above, and deliberately so: attribution is a fact about the first
    -- visit, whereas a name and a genre are what the person says about
    -- themselves today, so a new answer supersedes an old one. What must never
    -- happen is the blank case wiping a stored value — someone re-signing up
    -- from a listener form, or as an artist who left genre empty, keeps what
    -- they told us before. Hence coalesce(excluded, stored), not plain
    -- excluded.
    artist_name = coalesce(excluded.artist_name, public.waitlist_signups.artist_name),
    genre       = coalesce(excluded.genre,       public.waitlist_signups.genre),
    -- name follows artist_name rather than the UTMs, for the same reason, and
    -- it is the one that most needs the blank guard: every one of the existing
    -- rows has a null here, so the FIRST time one of those people signs up
    -- again is the only chance this table gets to learn what they are called.
    -- A later submission from an older cached bundle, which sends no name at
    -- all, must not take it back off them.
    name        = coalesce(excluded.name,        public.waitlist_signups.name);
$function$;

-- 3. Re-apply the execute lock down.
--
-- REQUIRED, not tidiness. Dropping a function discards its ACL, and a newly
-- created function in public picks up Supabase's default privileges afresh, so
-- step 2 would otherwise silently hand anon the ability to call the signup RPC.
-- Note `from public, anon` and not `from public` alone: PUBLIC and anon are
-- different grantees and revoking the first does not remove a direct grant to
-- the second. The pre-migration ACL is
-- {postgres=X/postgres,service_role=X/postgres}; this restores it for the new
-- signature.

revoke all on function public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text, text
) to service_role;

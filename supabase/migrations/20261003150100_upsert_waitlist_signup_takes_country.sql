-- upsert_waitlist_signup learns to store the country.
--
-- Board rows 2603 and 2594 (work_items 297). Depends on 20261003150000, which adds the column.
--
-- DROP then CREATE, not CREATE OR REPLACE, for the reason written out in 20260918090000 and
-- 20260824120000: replace only replaces an IDENTICAL signature, so with an extra parameter it
-- would leave the old thirteen argument function beside this one, and PostgREST would resolve
-- a call to whichever matched. A call that landed on the old one would write a null country on
-- every signup, which is the failure with no symptom.
--
-- p_country goes LAST and defaults to null, so a thirteen argument call from the currently
-- deployed site still resolves here. This migration is therefore safe to apply before the code
-- that fills the field, and the code is safe to ship before the migration (the route steps back
-- on PGRST202).
--
-- THE BODY BELOW IS THE LIVE ONE, copied from `pg_get_functiondef` on kfgootvqcdnfdzzustyb on
-- 3 October 2026 (prosrc md5 610203345b3b2e93418b96641bf2f449), with exactly two additions:
-- `country` in the insert and in the update list.
--
-- COUNTRY FOLLOWS THE UTMs, NOT THE NAME: first touch wins. Where somebody first signed up from
-- is a fact about that visit, and a later visit from another country does not rewrite it. It IS
-- allowed to fill a null, which is how a pre-existing row learns a country the first time that
-- person signs up again.

drop function if exists public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text, text
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
  p_name         text default null,
  p_country      text default null
)
returns void
language sql
set search_path to ''
as $function$
  insert into public.waitlist_signups (
    email, role, source,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer, landing_path,
    artist_name, genre, name,
    country
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
    nullif(trim(p_name), ''),
    nullif(upper(trim(p_country)), '')
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
    name        = coalesce(excluded.name,        public.waitlist_signups.name),
    -- country follows the UTMs: where somebody FIRST signed up from is a fact
    -- about that visit. A later visit from elsewhere does not rewrite it, and a
    -- later visit with no header does not blank it, but a null may be filled.
    country     = coalesce(public.waitlist_signups.country, excluded.country);
$function$;

-- Re-apply the execute lock down, for the reason 20260918090000 gives at length: dropping a
-- function discards its ACL, and a new function in public takes Supabase's default privileges
-- afresh, which hand EXECUTE to anon and authenticated. `from public, anon, authenticated`
-- and not `from public` alone. The pre-migration ACL, read on 3 October, is
-- {postgres=X/postgres,service_role=X/postgres}; this restores it for the new signature.

revoke all on function public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text, text, text
) to service_role;

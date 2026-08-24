-- Artist name and genre on waitlist_signups.
--
-- The waitlist has been a list of bare email addresses with a role beside them.
-- Artists now say what they are called and, optionally, what they make, so the
-- list can be read as an audience rather than counted.
--
-- Same two-part shape as the attribution migration, and for the same reason:
-- signups never touch the table directly, they go through the
-- upsert_waitlist_signup RPC. Adding columns without changing the function
-- would leave both new columns null forever, silently.

-- 1. The columns.
--
-- Both nullable, and nothing is backfilled. The 100-plus existing rows keep
-- nulls, which is the honest value: nobody was asked. Non-artists are never
-- asked either, so null here also means "not applicable", not "missing".

alter table public.waitlist_signups
  add column if not exists artist_name text,
  add column if not exists genre       text;

create index if not exists waitlist_signups_genre_idx
  on public.waitlist_signups (genre);

-- 2. The function.
--
-- DROP then CREATE, not CREATE OR REPLACE. Replace only replaces an identical
-- signature; with two extra parameters it would instead create a second,
-- twelve-argument function alongside the existing ten-argument one. Nothing
-- would error. The API's ten named arguments would keep resolving to the old
-- function, which knows nothing about the new columns, and every signup would
-- write null to both — the failure mode with no symptom. Dropping the exact
-- old signature here guarantees exactly one upsert_waitlist_signup exists.
--
-- Both new parameters default to null, so a ten-argument call from the
-- currently deployed site still resolves to this function. The migration is
-- therefore safe to apply before the code that fills the new fields.

drop function if exists public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text
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
  p_genre        text default null
)
returns void
language sql
set search_path to ''
as $function$
  insert into public.waitlist_signups (
    email, role, source,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer, landing_path,
    artist_name, genre
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
    nullif(trim(p_genre), '')
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
    genre       = coalesce(excluded.genre,       public.waitlist_signups.genre);
$function$;

-- Which genre codes are valid is NOT constrained here, on purpose. The list is
-- a point-in-time copy of the platform's taxonomy (lib/waitlistGenres.ts) that
-- is expected to drift; the API route rejects unknown codes, and a database
-- constraint would only add a second place to forget to update.

-- 3. Re-apply the execute lock down.
--
-- REQUIRED, not tidiness. Dropping a function discards its ACL, and a newly
-- created function grants EXECUTE to PUBLIC by default, so step 2 would
-- otherwise silently hand the anon role the ability to call the signup RPC.
-- The pre-migration ACL is {postgres=X/postgres,service_role=X/postgres};
-- this restores it for the new signature.

revoke all on function public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text
) from public;

revoke all on function public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text
) from anon, authenticated;

grant execute on function public.upsert_waitlist_signup(
  text, text, text, text, text, text, text, text, text, text, text, text
) to service_role;

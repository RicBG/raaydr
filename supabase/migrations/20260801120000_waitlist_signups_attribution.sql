-- Attribution capture on waitlist_signups.
--
-- GA4 knows which campaign brought a visitor; the database did not, so the two
-- could not be joined. This closes that gap for rows created from here on.
--
-- Two parts, and the second is easy to miss: signups do not go through a table
-- insert. app/api/waitlist/route.ts calls the upsert_waitlist_signup RPC, whose
-- signature is fixed at three parameters. Adding columns alone would change
-- nothing, because nothing would ever write to them.

-- 1. The columns.
--
-- All nullable, and the 60 rows that predate this stay null. They are not
-- backfilled and must not be: any value would be invented, and an invented
-- attribution is worse than a missing one because it looks like evidence.

alter table public.waitlist_signups
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content  text,
  add column if not exists utm_term     text,
  add column if not exists referrer     text,
  add column if not exists landing_path text;

create index if not exists waitlist_signups_utm_campaign_idx
  on public.waitlist_signups (utm_campaign);

create index if not exists waitlist_signups_utm_source_idx
  on public.waitlist_signups (utm_source);

-- 2. The function.
--
-- Dropped and recreated rather than overloaded. CREATE OR REPLACE only replaces
-- an identical signature, so adding parameters would leave two functions of the
-- same name, and PostgREST refuses to resolve an ambiguous RPC overload. The
-- new parameters all default to null, so a three-argument call from the
-- currently deployed site keeps working against this function unchanged. That
-- makes the migration safe to apply before the code that uses it.

drop function if exists public.upsert_waitlist_signup(text, text, text);

create or replace function public.upsert_waitlist_signup(
  p_email        text,
  p_role         text,
  p_source       text,
  p_utm_source   text default null,
  p_utm_medium   text default null,
  p_utm_campaign text default null,
  p_utm_content  text default null,
  p_utm_term     text default null,
  p_referrer     text default null,
  p_landing_path text default null
)
returns void
language sql
set search_path to ''
as $function$
  insert into public.waitlist_signups (
    email, role, source,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer, landing_path
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
    nullif(trim(p_landing_path), '')
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
    landing_path = coalesce(public.waitlist_signups.landing_path, excluded.landing_path);
$function$;

-- No RLS policy change is needed. The table has RLS enabled with zero policies,
-- and inserts run server side through the service role key, which bypasses RLS
-- entirely. Verified against pg_policies on 1 August 2026: there is no column
-- enumerating insert policy to keep in step.

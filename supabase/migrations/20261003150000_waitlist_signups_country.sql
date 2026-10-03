-- Where a sign-up came from, as a country code and nothing else.
--
-- Ric, 3 October 2026, board rows 2566, 2594 and 2603 (work_items 297): anyone can sign up
-- from anywhere, listeners included, and where they sign up from tells him which country to
-- license next. The table had no country column, so there was nothing to count.
--
-- THE CODE ONLY. Never the address. The site reads Vercel's `x-vercel-ip-country` and stores
-- two capital letters, or null. There is no column here that could hold an address, and the
-- privacy policy line for this is Riz's to draft and Ric's to rule.
--
-- NULLABLE, AND NOTHING IS BACKFILLED. The 211 rows that exist keep a null, which is the
-- honest value: nobody recorded where they came from, and there is nothing to backfill FROM.
-- Ruled on row 2566: "existing rows stay blank".
--
-- TWO CHARACTERS OF UPPER CASE ENFORCED BY THE TABLE, not trusted from the route. The route
-- already refuses anything else, and a hand written insert should not be able to put a
-- sentence in a column the Control Room will group by.
--
-- THIS FILE IS THE COLUMN ONLY. The function that writes it is the next file, so the two can
-- be applied, and reverted, separately. Ric's clearance on 3 October names the column.

alter table public.waitlist_signups
  add column if not exists country text;

alter table public.waitlist_signups
  drop constraint if exists waitlist_signups_country_shape;

alter table public.waitlist_signups
  add constraint waitlist_signups_country_shape
  check (country is null or country ~ '^[A-Z]{2}$');

comment on column public.waitlist_signups.country is
  'ISO 3166-1 alpha-2 code of the connection the sign-up was made from, from Vercel''s edge. Never an address. Null when the edge did not say, and for every row created before 3 October 2026.';

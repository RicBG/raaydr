-- Producer, songwriter or both: the one extra answer a "Songwriter or Producer" can give.
--
-- Ric, 15 October 2026, board rows 3376 and 3383; the front end half is PR #95 (row 3497) and
-- this is the data half Deuce asked `claude-code` for on that row. Producers and songwriters are
-- two audiences in the back end and one option on the site, and today `role` holds the single
-- value `songwriter_producer`, so nobody can tell them apart.
--
-- THE ROLE DOES NOT CHANGE. A new role slug would break everything that checks the role, which
-- is the option PR #95's decision record rejects. This is a sub type beside it.
--
-- NULLABLE, AND NOTHING IS BACKFILLED. The answer is optional on the form (one tap is a nudge,
-- not a gate), and every row that exists was never asked. Null is the honest value for both.
--
-- THREE VALUES ENFORCED BY THE TABLE, not trusted from the route. The route already drops
-- anything it does not recognise, and a hand written insert should not be able to put a
-- sentence in a column the Control Room will group by. The three are the slugs in
-- `lib/creatorKind.ts`, in the same spelling.
--
-- THIS FILE IS THE COLUMN ONLY. The function that writes it is the next file, so the two can
-- be applied, and reverted, separately, exactly as 20261003150000 and 20261003150100 were.
-- Neither is applied by the repository: the apply is Ric present, on kfgootvqcdnfdzzustyb.

alter table public.waitlist_signups
  add column if not exists creator_kind text;

alter table public.waitlist_signups
  drop constraint if exists waitlist_signups_creator_kind_shape;

alter table public.waitlist_signups
  add constraint waitlist_signups_creator_kind_shape
  check (creator_kind is null or creator_kind in ('producer', 'songwriter', 'both'));

comment on column public.waitlist_signups.creator_kind is
  'Which kind of creator a songwriter_producer signup said they are: producer, songwriter or both. Optional on the form, so null means not asked or not answered. Meaningless for any other role and left null there. Board rows 3376, 3383, 3497.';

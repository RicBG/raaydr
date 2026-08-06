# Human Plus — Marketing Readout

Weekly and monthly view of social and web performance for the three founders.
Next.js on Vercel, data in Supabase (`human-plus-metrics`, ref
`oqvlfujwtimmglbggupg`). Completely separate from RAAYDR — it shares no code,
no database and no Vercel project with the tracker; it only lives in this repo
until it gets a home of its own. Everything under this directory is
self-contained and can be lifted into a new repo verbatim.

## The one architectural rule

**No metrics data in the code.** Every figure renders from Supabase at request
time (`export const dynamic = "force-dynamic"` on the page, uncached fetches).
The weekly update is Ric asking Claude in chat; Claude writes rows straight
into the database through the Supabase MCP connector. A weekly update must
never require a commit, a build or a deploy.

## Data

Three tables, all with RLS on:

- `weekly_metrics` — one row per week, PK `week_start`. Public select.
- `monthly_metrics` — one row per month, PK `month` (`'2026-07'`). Public select.
- `weekly_notes` — Ric's read/problem/next per week, FK to `weekly_metrics`.
  Public select, authenticated write.

All jsonb columns are keyed on the five channels: `li`, `ig`, `th`, `tk`, `x`.

The growth chart (followers per channel, end of each week) is derived from
`weekly_metrics.channel_followers` ordered by `week_start` — it has no table of
its own.

`web_visits` is nullable on both metric tables, and the UI renders a null as
"no data" / "—", never as a zero. A zero reads as a measurement; a blank reads
as a gap. Keep it that way.

## Notes editing

"Edit notes" asks for a Supabase email/password sign-in, then upserts into
`weekly_notes` with the caller's authenticated session — RLS does the actual
gatekeeping, the UI is just the door. Reads stay open to the whole team.

One-time setup: create a user for Ric in the Supabase dashboard
(Authentication → Users → Add user) with a password. No code change needed.

## Deploying

New Vercel project in the same org as the RAAYDR projects:

1. Root Directory: `human-plus-metrics`
2. Framework preset: Next.js (defaults are fine)
3. Enable **Vercel Authentication** under Settings → Deployment Protection so
   only the team can reach it.

No env vars are required: the Supabase URL and publishable key are baked in as
defaults (the publishable key is designed to be public; RLS guards the data).
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` override
them if the project ever moves.

## Local dev

```bash
cd human-plus-metrics
npm install
npm run dev
```

# The privacy page says we keep the country a sign-up came from

- **Date:** 3 October 2026
- **Decided by:** Ric, 22:14, wording ruled word for word (board row 2647)
- **Related:** board rows 2603, 2647; `RicBG/raaydr#86` (the site starts reading the country); `content/legal/privacy.md`
- **Status:** DECIDED
- **About:** The privacy page's sign-up row now says the country a sign-up came from is kept (worked out from the connection, IP address not kept), which has to be live before the tracker `country` column is switched on.

## The decision

One cell of the data table in `content/legal/privacy.md` changes. The sign-up row reads, after the change:
"Sign-up details from raaydr.com: email, role, artist name and genre, how you reached us, and the country you
signed up from (worked out from your connection; we don't keep your IP address)". The purpose and lawful basis
columns are unchanged. Nothing else in the file changes.

## Context

`RicBG/raaydr#86` makes the waitlist route read Vercel's `x-vercel-ip-country` and send a two letter code to
`upsert_waitlist_signup`. Until the `country` column exists on the tracker project the route steps back and stores
nothing. Switching the column on is the moment the site starts storing a new piece of personal data per sign-up, so
the page that describes what is stored has to say it first. Ric ruled the wording.

## Options rejected

Applying the column first and the page after. A policy that lags the collection is a disclosure gap for as long as
the lag lasts, however short.

## Evidence

Site suite 144 passing. The diff is one line of one table.

## What this does not decide

Whether the country is also a personal data category elsewhere (the platform's `profiles.country` is a separate,
existing field). The header forgery check on the live site is Riz's.

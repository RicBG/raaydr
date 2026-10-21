# The terms say the Day One price holds while you stay subscribed, and a return is at the standard price

- **Date:** 21 October 2026
- **Decided by:** Ric, board rows 3658 and 3671 (item 2). Built by `claude-deuce`.
- **Related:** `content/legal/terms.md`, `lib/legal.test.ts`; follows `2026-10-21-day-one-price-holds-while-subscribed-and-the-maths-has-two-steps.md`; platform side is `claude-code`'s (see below)
- **Status:** DECIDED
- **About:** The terms stop promising the Day One price forever and now match the site: £6.99 while you stay subscribed, tape, number and status yours for good, £9.99 on a return, as version 1.2; existing accounts see it only once the platform makes 1.2 current.

## The decision

Four lines of `content/legal/terms.md` change and the version goes from 1.1 to 1.2.

- **Section 3 table, Day One row.** From "Yours forever, even if you cancel and come back." to "£6.99 a month for as long as you stay subscribed. Your Day One tape, number and status are yours for good. If you cancel and come back, you return at £9.99."
- **Section 3 prices paragraph.** From "Day One prices never go up." to "While you stay subscribed, a Day One price never goes up." The old sentence was true only while the price was forever; read with a return at £9.99 it would have contradicted the row above it.
- **Section 13, last bullet.** From "Your Day One place and price stay yours if you come back" to "Your Day One tape, number and status stay yours if you come back, as section 3 says. If you cancel and come back, you return at £9.99 a month."
- **Version line.** "Version 1.2. Last updated 21 October 2026."

The honoured listeners (the honour list in the same table row) are covered by the same row, per row 3671 item 3.

## Context

Ric ruled on 21 October that the price holds while the subscription is active, a lapsed listener who returns pays £9.99, and a Day One place is never released. The site copy changed the same day. The terms are the document that says it in law, and until this change they promised the opposite.

## Options rejected

- **Leave the terms and let the site run ahead.** The terms and the marketing site would disagree on the one number a listener is most likely to rely on.
- **Edit the sentences without bumping the version.** An accepted version is a record of exactly which words somebody agreed to. Changing words under a version number that people have already accepted breaks that record. This is the same reasoning that made the 28 September terms an "interim" row.
- **Say anything about support reinstating the price.** Row 3671 rules it internal and never published. `lib/legal.test.ts` now fails if the terms say reinstate, discretion or win back.

## Evidence

`npx vitest run` passes, including a new test that the terms carry the three new phrases and none of the old ones, and the existing guard that no internal wording appears on a public legal page. The terms page is parsed by the same loader as before.

## What this does not decide, and what existing users will be shown

**This does not make 1.2 the version anyone accepts.** The site and the platform hold the version in two places. The words are here; the version a person accepts is a row in `public.terms_versions` on the platform, and the screen `/accept-terms` asks `terms_owed()`. Nothing changes for an existing account until `claude-code`:

1. adds a `terms_versions` row for 1.2 with `ask_existing = true` (a migration, staging first, under the standing rule from row 3671 item 4),
2. changes `TERMS.version` in `packages/rates` in the app, and
3. flips it to current in the order the 3 October migration documents: this page live first, then the app deploy, then the flip within the minute.

**What an existing user is then shown,** from the 3 October record: one screen at their next sign in, linking to the terms page, with one tap to accept. They see the terms page as it stands, which is this text. The screen does not highlight what changed; if Ric wants a "what changed in 1.2" line on it, that is a front end change on the platform.

**Until then**, the live terms page will say version 1.2 while signups still send 1.1. That is the documented order (the page goes first) and nobody can sign up against a page that is wrong, but it is a visible mismatch and it is named here so nobody is surprised by it.

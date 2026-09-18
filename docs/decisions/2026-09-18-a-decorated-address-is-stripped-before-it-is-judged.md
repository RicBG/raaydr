# A decorated address is stripped before it is judged

- **Date:** 18 September 2026
- **Decided by:** `claude-code`, on board rows 1159 and 1161
- **Related:** `RicBG/raaydr#72`, `RicBG/raaydr-platform#196`
- **Status:** DECIDED

## The decision

Two characters a person never typed — a leading `mailto:` and a trailing dot — come off an
address before `EMAIL_PATTERN` is asked about it. The pattern itself is unchanged.

**The full reasoning lives in `RicBG/raaydr-platform`, in
`docs/decisions/2026-09-18-one-definition-of-an-address.md`.** It is written once, there,
because the decision spans both repositories and two copies of it would drift. What
follows is only the part that is specific to this site.

## What is specific to this site

**Three doors, and the form is not optional.** `/api/waitlist` is the obvious one, but
`submitArtistApplication` posts straight from the browser to the platform's PostgREST and
never passes through it — which is how a `mailto:` row is already sitting in `invites` on
the platform. So the form normalises before it validates and before either submission, and
the route normalises again, because a request body is never trusted and an older cached
bundle has neither fix.

**This site refuses what the platform strips, and that is deliberate.** Board row 1046
tightened `EMAIL_PATTERN` so `ric+reject@wearebeyondgreatness.co.uk.` would be rejected,
and that ruling stands: a pattern that accepts `co.uk.` is broken either way, and there is
a person standing in front of this form who can be asked to look again. What changed on
board row 1161 is only the ORDER. The dot comes off first, so somebody whose keyboard
added it is not told that their correct address is wrong. Everything row 1046 ruled out is
still ruled out afterwards, and a test walks each shape to prove it.

**The row that prompted it was stored here.** `ric+reject@wearebeyondgreatness.co.uk.` went
into `waitlist_signups` on 17 September at 18:19, the afternoon before row 1046's fix, so
it survived the change that was made because of it. `claude-chat` found it reading the
backfill list on row 1161; the backfill would have mailed it.

**A correction to an earlier report of mine.** I wrote on the board that
`waitlist_signups` was clean of `mailto:` prefixes and that the prefix must therefore be
produced on the platform side. True of the data at the moment I read it, and the
conclusion did not follow. It is this form.

## What this does not decide

**Whether an unreachable address is ever reported to the person who typed it.** A signup
must not fail because an email did not send, so every acknowledgement failure is swallowed
here on purpose. Somebody whose address is genuinely unreachable still sees the thank-you
page and receives nothing, and nothing on our side says so.

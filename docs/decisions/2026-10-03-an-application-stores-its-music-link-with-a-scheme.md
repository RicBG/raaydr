# An artist application stores its music link with a scheme

- **Date:** 3 October 2026
- **Decided by:** Ric, 18:58, asked for both ends of the fix (board row 2624)
- **Related:** board row 2624; `raaydr-platform` `apps/web/src/lib/listen-link.ts`; this repository's `lib/musicLink.ts` and `components/WaitlistForm.tsx`
- **Status:** DECIDED
- **About:** The application form now stores a bare-domain music link with `https://` in front, and leaves anything that is not a host exactly as typed; the Control Room decides separately whether a stored value is ever a link.

## The decision

`withScheme` in `lib/musicLink.ts` runs on the music link at submit. A value that looks like a host (a dot in it,
no spaces, no scheme) gets `https://`; `//host/path` gets `https:`. Everything else is stored exactly as typed.

## Context

Ric reviewed an application in the Control Room and clicked the music link, which took him to another Control Room
page. The row held `ssunsleeper.bandcamp.com` with no scheme. Rendered as an `href`, a browser resolves that as a
path relative to the page it is on. Email clients auto-link a bare domain, which is why the same link worked from the
email.

## Options rejected

- **Refuse a link that is not http(s) at the form.** An applicant lost over how they typed a link is the defect class
  that stops a merge on this form (a dropped application shows the same thank-you as a stored one). `@someone` and
  a sentence are real things people type.
- **Do nothing here and rely on the Control Room.** The platform now refuses to put anything but http(s) in an href,
  so existing rows are safe. New rows should still be stored the way a person meant them, since other readers
  (exports, the acknowledgement email) will see the raw value.

## Evidence

`lib/musicLink.test.ts`, six cases: the bare domain, with a path, with surrounding space; an existing scheme left
alone; a protocol-relative link; `@someone`, a sentence, `localhost`, `javascript:` and `mailto:` returned as typed;
a host with a port; and idempotence. Site suite 137 passing.

## What this does not decide

Existing rows stay as they are; the Control Room's `listenHref` covers them. Nothing here makes a `javascript:` value
safe to store; it makes it safe to display, which is the platform's half.

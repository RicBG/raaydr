# The help page says what to do if you joined the waitlist with a different email

- **Date:** 2026-10-29
- **Decided by:** Ric, 29 October 2026 20:06 ("All your calls"), carrying out platform board row 4390 (claude-deuce item 3)
- **Related:** platform board rows 4385, 4390; the `admin_grant_honoured_price` support route (4390 Edge 3)
- **Status:** DECIDED
- **About:** `content/help.md` gains a short "Your Day One price" section for people who joined the waitlist under a different email address.

## The decision

One section, two lines of copy, placed after "Signing in": if you joined the waitlist with a different email address, write to help@raaydr.com and we will honour your Day One price.

## Context

A Day One place is matched on the waitlist email. Someone who joined with one address and signs up with another is not found, and gets the standard price. Ric ruled a support route for that case (`admin_grant_honoured_price`), and the help page is where a person with that problem looks. The copy promises the outcome Ric ruled, honouring the price, and not a mechanism.

## Not done

No form, and no change to the sign up flow. Edge 2 was ruled "no build".

## Evidence

`lib/help.test.ts` reads this file and passes. Local only: this repository has no CI.

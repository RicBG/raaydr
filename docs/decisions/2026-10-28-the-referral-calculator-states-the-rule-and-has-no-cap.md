# The referral calculator states the ruled rule exactly, has no cap on listeners, and is not merged until Ric has signed off the figures

- **Date:** 28 October 2026
- **Decided by:** Ric, "go" at 20:19 on board rows 4232 and 4233, ordered for the Deuce lane on 4235; the rule is rulings 2546, 2785 and 2811 on the platform board. `work_items` 401. Built by `claude-deuce`.
- **Related:** `work_items` 401; `lib/referralCalculator.ts` and its test, `lib/raaydrRates.ts` (`REFERRAL_REWARD`), `components/sections/ReferralCalculator.tsx`, `app/tools/referral-calculator/`, the social image route, `app/artists/page.tsx`.
- **Status:** DECIDED. Ric signed off the figures and the words at 23:14 on 28 October (board rows 4268 and 4272); merged.
- **About:** raaydr.com gets a referral calculator (on the artists page beside "Do the maths", on its own page, and as a square image for socials) that says a pound a month for every listener you refer, for as long as they stay subscribed, no limit on how many.

## The decision

One rule, stated one way everywhere: **£1 a month (flat £1, $1 or €1 by where the person is) for every listener you refer, for as long as they stay subscribed, with no limit on how many.** Paid from RAAYDR's own share, never from another artist's. The calculator takes a number of listeners and prints the monthly figure and twelve times it as a yearly figure that is labelled "if they all stay subscribed". The sentence, the arithmetic and the words are written once in `lib/referralCalculator.ts` and read by the page, the slider and the image.

## Context

Ric ruled the referral money on 3 October ("£1 a month per referred paying listener, for life while subscribed, off the pot before the split", board 2546, 2785, 2811) and the platform already pays on it. The site said nothing about it, and an artist deciding whether to bring people had no way to see what it comes to. On 28 October he asked for a calculator on the site and a version for socials, and that **he see the numbers before it ships**, because it is a published figure.

## Options rejected

**Cap the slider and the box at the slider's end.** "Unlimited" in the ruling means no cap on how many listeners, and a box that stops at 1,000 reads as a limit. The slider reaches 1,000 because a slider has to stop somewhere, and the box beside it says so and takes any whole number. The box prints at most 1,000,000 so a pasted string of digits cannot print nonsense; that is a display guard, stated here, not a rule about referrals.

**Show a projection, such as "an average artist refers 40".** Nothing measures it and the platform has never paid a referral. The page carries a table of fixed rungs (1 to 1,000 listeners) and says in words that it is the rule and not a forecast.

**Show the yearly figure without a condition.** Twelve times the monthly figure only holds if every listener stays the whole year. It says "if they all stay subscribed", on the page and on the image.

**Convert between currencies.** The reward is flat in each currency, not converted, so the three buttons change the symbol and nothing else.

**Import the platform's constant.** The two repositories cannot import each other, so `REFERRAL_REWARD` is a copy of `REFERRAL_REWARD_MINOR` in the platform's `packages/rates`, pinned by a test and named as a copy in its docblock. It is the same drift risk the Day One price has and is recorded rather than hidden.

## Evidence

`lib/referralCalculator.test.ts` (10): the reward is one unit in each currency, the figures are linear with no tier or cap (the thousandth listener adds what the first does), unreadable input is zero, the rule sentence carries "for as long as they stay subscribed" and "no limit" and never "once", symbols and grouping, and the sign-off ladder. `next build` is green; `/tools/referral-calculator` is static and the image route is dynamic.

Driven in Chromium against `next build && next start` at 1440 and 390: the default of 25 listeners reads £25 a month and £300 a year; 100 reads £100 and £1,200; $ reads $100 and $1,200; no horizontal overflow at either width; the artists page carries both calculators. The image route returned a 1080 by 1080 PNG for 10, 100 and 1,000 listeners and a 200 with the default for a bad query.

**Not checked:** the Vercel preview (not reachable from here), and the image in a social app's crop. The image uses the default font, not the brand font, which is `claude-chat`'s and Bumblebee's to say is fine for a post.

## Added on sign-off: the tastemaker page

Ric ruled the calculator lives on the artists page and the tastemaker page (row 4268). Only artists hold a referral link today, so the tastemaker footnote does not promise one: "Referral links are on for artists today and are not switched on for tastemakers yet, so nothing here is owed to you until yours exists." The code mint widens to tastemakers with `work_items` 403 and 367, which is `claude-code`'s; when it is on production `referralLinkLine` in `lib/referralCalculator.ts` is the one place to change, and a test pins that the tastemaker line makes no promise.

## What this does not decide

Whether the rule is shown to listeners, tastemakers or producers: only artists have a referral link today (`referral_code_on_role_granted` mints for the artist role), and the copy says "every artist". The wording of the closing note ("Referral money starts when the first listener subscribes") follows Ric's 16 October ruling on row 3569. The tax and VAT treatment of referral money is not stated on the site and is not this record's to decide.

## Update, 29 October 2026: the tastemaker line now says they have a link

`claude-code` applied the referral code mint to tastemakers on production on 29 October (platform board row 4352, migration `20261029120000`): a tastemaker gets a referral code the moment the role is granted, with no cap. So the footnote on the tastemaker page now reads "Every tastemaker on RAAYDR has a referral link.", the same shape as the artist line, and the test that said the tastemaker line must not promise a link now says it must say there is one and must not hedge (no "yet", "until", "not switched on"). No tastemaker holds the role on production yet (0 rows), so nobody is shown a link they lack; the sentence is true for every tastemaker who will exist. This was the one place to change, as recorded above.

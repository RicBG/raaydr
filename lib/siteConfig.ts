import { DAY_ONE_NEXT_BAND, PRICING } from "./raaydrRates";

export type SiteMode = "waitlist" | "live";

export const siteConfig = {
  mode: "waitlist" as SiteMode, // "waitlist" | "live"
  // Pricing reads from the single source of truth in raaydr-rates.ts.
  pricing: {
    dayOne: PRICING.dayOne,
    dayOneNext: PRICING.dayOneNext,
    standard: PRICING.standard,
    plus: PRICING.plus,
    dayOneCap: PRICING.dayOneCap,
    dayOneFirstBand: PRICING.dayOneFirstBand,
    dayOneNextBand: DAY_ONE_NEXT_BAND,
  },
  cta: {
    waitlist: { primary: "Claim your spot", closing: "Claim your spot" },
    live: { primary: "Start listening", closing: "Become a member" },
  },
};

export const ctaCopy = () => siteConfig.cta[siteConfig.mode];

// The platform's sign in page. app.raaydr.com is the production domain of the
// raaydr-platform-web Vercel project, read from that project's domain list.
// There is no sign up link beside it on purpose: platform signup is invite only.
export const platformLoginUrl = "https://app.raaydr.com/login";

/*
 * THE PLATFORM APPLICATION FORMS, and the UTMs are part of the URL rather than added by a
 * caller. Board rows 5347 and 5369, Ric 11 November.
 *
 * `tastemaker` is the form `apply_as_tastemaker` sits behind, confirmed live in Deuce's walk on
 * row 5289; `artist` is the artist application the site's old "join the waitlist" buttons used
 * to collect in a list of our own.
 *
 * **WHY A CONSTANT RATHER THAN THE URL AT EACH BUTTON.** A UTM typed at a call site is a UTM
 * that will be typed differently at the next one, and then a campaign splits into two rows in
 * the email tool and neither reads as the truth. One string per form, every button reads it.
 *
 * **AND WHY THERE IS NO LISTENER ENTRY.** Listeners stay on the waitlist until the app is in
 * the stores (Ric, 29 October). An entry here would be a path to a form that does not accept
 * them, and the absence is the rule rather than an oversight.
 */
const APPLY_UTMS = "utm_source=raaydr_site&utm_medium=web&utm_campaign=tastemakers";

export const applyUrl = {
  tastemaker: `https://app.raaydr.com/apply/tastemaker?${APPLY_UTMS}`,
} as const;

/*
 * THERE IS NO `artist` ENTRY HERE, AND THAT IS A FINDING RATHER THAN AN OMISSION.
 *
 * Board row 5369 asks for the site's artist "join the waitlist" and "claim your spot" buttons to
 * point at "the artist application on the platform", the way the tastemaker one now points at
 * `/apply/tastemaker`. Two things make that the wrong change:
 *
 *   1. **There is no such page.** `app.raaydr.com/apply` does not exist: the platform's only
 *      apply route is `/apply/tastemaker`. A button pointing there is a 404.
 *   2. **Artists already apply from THIS site, on purpose.** `WaitlistForm` detects an artist
 *      role and calls `submitArtistApplication`, which posts `apply_to_raaydr` to the platform
 *      straight from the visitor's browser. `lib/artistApplication.ts` says at length why that
 *      must not move behind any server hop: `apply_to_raaydr` reads the applicant's address from
 *      Cloudflare's `cf-connecting-ip` and caps applications at twenty per address per hour, so
 *      routing them through anything of ours turns that cap into a count of EVERYBODY and
 *      silently drops the twenty-first real applicant in any hour -- on the day paid advertising
 *      sends this form its heaviest traffic.
 *
 * So an artist filling that form is already filing an application, not joining a list. What is
 * left is a WORDING question -- the buttons still say "claim your spot", which sounds like a
 * list -- and that is Riz's copy call, raised on the board rather than guessed at here.
 */

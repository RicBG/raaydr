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

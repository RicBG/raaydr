import { PRICING } from "./raaydrRates";

export type SiteMode = "waitlist" | "live";

export const siteConfig = {
  mode: "waitlist" as SiteMode, // "waitlist" | "live"
  // Pricing reads from the single source of truth in raaydr-rates.ts.
  // ONE Day One band. `dayOneNext`, `dayOneFirstBand` and `dayOneNextBand`
  // were here until 9 October 2026, carried for a retired £7.99 tier that no
  // page read; see the note above PRICING in raaydrRates.ts.
  pricing: {
    dayOne: PRICING.dayOne,
    standard: PRICING.standard,
    plus: PRICING.plus,
    dayOneCap: PRICING.dayOneCap,
  },
  cta: {
    waitlist: { primary: "Claim your spot", closing: "Claim your spot" },
    live: { primary: "Start listening", closing: "Become a member" },
  },
};

export const ctaCopy = () => siteConfig.cta[siteConfig.mode];

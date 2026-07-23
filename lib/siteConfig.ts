import { PRICING } from "./raaydrRates";

export type SiteMode = "waitlist" | "live";

export const siteConfig = {
  mode: "waitlist" as SiteMode, // "waitlist" | "live"
  // Pricing reads from the single source of truth in raaydr-rates.ts.
  pricing: {
    dayOne: PRICING.dayOne,
    standard: PRICING.standard,
    plus: PRICING.plus,
    dayOneCap: PRICING.dayOneCap,
  },
  cta: {
    waitlist: { primary: "Join the free waitlist", closing: "Claim your spot" },
    live: { primary: "Start listening", closing: "Become a member" },
  },
};

export const ctaCopy = () => siteConfig.cta[siteConfig.mode];

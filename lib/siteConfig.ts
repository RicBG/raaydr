export type SiteMode = "waitlist" | "live";

export const siteConfig = {
  mode: "waitlist" as SiteMode, // "waitlist" | "live"
  pricing: { founding: 5.99, standard: 7.99, foundingCap: 1000 },
  // platformShareOfRemainder (30%) is constant across tiers; only the flat
  // tastemakerFund amount changes. Standard's 1.99 is what reproduces the
  // locked £4.20 artist-per-fan figure: (7.99 − 1.99) × 0.70 = 4.20, the
  // same formula shape as founding's (5.99 − 0.99) × 0.70 = 3.50.
  split: {
    tastemakerFund: { founding: 0.99, standard: 1.99 },
    platformShareOfRemainder: 0.3,
  },
  economics: { spotifyPerStream: 0.003, matchStreamsPerListener: 4 },
  cta: {
    waitlist: { primary: "Join the free waitlist", closing: "Claim your spot" },
    live: { primary: "Start listening", closing: "Become a member" },
  },
};

export const ctaCopy = () => siteConfig.cta[siteConfig.mode];

export type SiteMode = "waitlist" | "live";

export const siteConfig = {
  mode: "waitlist" as SiteMode, // "waitlist" | "live"
  pricing: { founding: 5.99, standard: 7.99, foundingCap: 1000 },
  split: { tastemakerFund: 0.99, platformShareOfRemainder: 0.3 }, // artist gets 3.50
  economics: { spotifyPerStream: 0.003, matchStreamsPerListener: 4 },
  cta: {
    waitlist: { primary: "Join the free waitlist", closing: "Claim your spot" },
    live: { primary: "Start listening", closing: "Become a member" },
  },
};

export const ctaCopy = () => siteConfig.cta[siteConfig.mode];

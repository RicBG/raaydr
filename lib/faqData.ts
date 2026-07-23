// FAQ content for RAAYDR site-wide accordion component.
// Keyed by page. Each page's array renders as its own FAQ section, and the
// same array generates that page's FAQPage JSON-LD, so the two never drift.
//
// Copy rules (see the site build spec): earnings are stated as a percentage
// with its denominator, never as a standalone pound figure. Pricing and the
// payout threshold may use pounds. No em dashes or en dashes anywhere.

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqPageKey =
  | "home"
  | "artists"
  | "producersSongwriters"
  | "tastemakers"
  | "listeners"
  | "about";

export const faqData: Record<FaqPageKey, FaqItem[]> = {
  home: [
    {
      question: "What is RAAYDR?",
      answer:
        "RAAYDR is a new music streaming platform built to pay artists, songwriters, producers and tastemakers based on real listener attention, not just play counts. Spotify pays for streams. RAAYDR pays for attention.",
    },
    {
      question: "How is RAAYDR different from Spotify or Apple Music?",
      answer:
        "On Spotify your money goes into a global pool and gets averaged out across everyone. On RAAYDR your subscription goes to the artists you actually listen to, in proportion to how much of your listening each one holds. The practical difference is roughly a hundred times per person.",
    },
    {
      question: "Is RAAYDR live yet?",
      answer:
        "Not yet, we're in waitlist mode right now while we finish building the platform. Joining the waitlist locks in Day One pricing and early access.",
    },
    {
      question: "What's the Day One offer?",
      answer:
        "The first 1,000 listeners, the Day Ones, get RAAYDR at £6.99 a month, locked forever, instead of the standard £9.99. The first 100 artists, 100 producers and songwriters, and 25 tastemakers get RAAYDR+ free forever.",
    },
    {
      question: "Where is RAAYDR available?",
      answer:
        "RAAYDR is open worldwide for the waitlist, though our active marketing right now is focused on the UK.",
    },
    {
      question: "How do artists get paid on RAAYDR?",
      answer:
        "55% of every subscription, after tax, publishing royalties and card fees, goes to artists, split by how much of each fan's listening they hold. Payouts run monthly once an artist passes £50, straight to their bank through Stripe. You can see what your own audience would look like on the calculator.",
    },
    {
      question: "Who is RAAYDR for?",
      answer:
        "Independent artists, songwriters, producers, tastemakers and the listeners who back them. Each has their own page built around how RAAYDR works specifically for them.",
    },
    {
      question: "What is a tastemaker on RAAYDR?",
      answer:
        "Someone whose recommendations genuinely move listeners to discover and stick with new artists. RAAYDR pays them from a ring-fenced share of every subscription, up to 15%, and anything nobody earns goes to the artists.",
    },
    {
      question: "Is there a free plan?",
      answer:
        "No. Playing music requires a subscription. That is deliberate: it is what makes fake accounts pointless here, because a subscription costs more than any account could ever extract.",
    },
  ],

  artists: [
    {
      question: "How much do artists earn?",
      answer:
        "55% of every subscription, after tax, publishing royalties and card fees. Your share of that comes from how much of each fan's listening time you hold, so a fan who plays you constantly is worth more to you than one who plays you occasionally. Use the calculator to see what your own audience would look like.",
    },
    {
      question: "How is this different from Spotify?",
      answer:
        "On Spotify your earnings come from a global pool, so your fans' money gets averaged out across everyone. On RAAYDR your fans' money goes to you, in proportion to how much of their listening you hold. The practical difference is roughly a hundred times per person.",
    },
    {
      question: 'What counts as "attention share"?',
      answer:
        "It's the proportion of a fan's total listening time each month that goes to you specifically, out of everyone they listen to. It rewards artists who hold a fan's actual attention, not just artists who get added to a playlist and skipped.",
    },
    {
      question: "When do I get paid?",
      answer:
        "Monthly, once your balance passes £50, straight to your bank through Stripe. There's no manual invoicing, it's automatic once you cross the threshold.",
    },
    {
      question: "What is RAAYDR+?",
      answer:
        "A deeper analytics and tools layer for artists, producers, songwriters and tastemakers. It is £3.99 a month, and free forever for our founding creators. Everything you need to trust your numbers, what you earned, who it came from and when it lands, is free for every creator. RAAYDR+ is about what you do with that.",
    },
    {
      question: "Do I need a label or distributor to join?",
      answer:
        "No, RAAYDR is built for independent artists directly. There's no gatekeeping layer between you and your fans' subscriptions.",
    },
    {
      question: "What happens if a fan cancels their subscription?",
      answer:
        "Your earnings from that fan stop when their subscription does, the same way any subscription based payment works. Your income is built from your whole fanbase across the platform, not any single fan.",
    },
  ],

  producersSongwriters: [
    {
      question: "How do producers and songwriters get paid on RAAYDR?",
      answer:
        "You earn a share of the artist's attention based earnings for any track you're credited on, at a split you agree directly with the artist, commonly around 30 percent of that song's share but entirely up to what you've negotiated. As the artist earns more from real fan attention, your cut grows with it.",
    },
    {
      question:
        "How is this different from a typical production or songwriting deal?",
      answer:
        "Right now most streaming income is so diluted per stream that agreed splits barely add up to anything. Because RAAYDR pays from real fan attention rather than a global pool, the same agreed percentage translates into real, trackable monthly income.",
    },
    {
      question: "Do I set my own split percentage?",
      answer:
        "The split is whatever you and the artist agree on for that song, RAAYDR doesn't dictate it. Our calculator lets you plug in your agreed percentage to see what it means for you.",
    },
    {
      question: "How do I track my earnings?",
      answer:
        "RAAYDR+ gives producers and songwriters their own dashboard showing which tracks are earning, what attention share they're pulling, and what your split translates to each month.",
    },
    {
      question: "Is RAAYDR+ free for producers and songwriters?",
      answer:
        "Yes, the first 100 producers and songwriters to join get RAAYDR+ free forever. After that it's £3.99 a month.",
    },
    {
      question: "When do I get paid?",
      answer: "Monthly, once your balance passes £50, straight to your bank through Stripe, same as artists.",
    },
  ],

  tastemakers: [
    {
      question: "What exactly is a tastemaker on RAAYDR?",
      answer:
        "Someone whose picks and playlists genuinely introduce listeners to music they stick with. If people trust your taste enough to act on it, RAAYDR pays you for that influence.",
    },
    {
      question: "How does the tastemaker fund work?",
      answer:
        "Up to 15% of every subscription is ring fenced for tastemakers, after tax, publishing royalties and card fees. You earn from it based on how much of a listener's attention your recommendations actually drove. Anything nobody earns goes to the artists.",
    },
    {
      question: "Do I need to be a celebrity or influencer to qualify?",
      answer:
        "No, what matters is whether the fans you're connected to on RAAYDR actually listen because of you, not how many followers you have elsewhere.",
    },
    {
      question:
        "How is this different from being paid for a playlist placement?",
      answer:
        "Playlist placement fees are usually a flat one off payment regardless of what happens after. RAAYDR pays you monthly and ongoing, tied to whether the fans you brought in keep listening.",
    },
    {
      question: "Is RAAYDR+ free for tastemakers?",
      answer:
        "The first 25 tastemakers to join get RAAYDR+ free forever, after that it's £3.99 a month for the full dashboard.",
    },
    {
      question: "When do I get paid?",
      answer:
        "Monthly, once your balance passes £50, straight to your bank through Stripe, same as every other creator role.",
    },
  ],

  listeners: [
    {
      question: "Why would I pay for RAAYDR instead of Spotify or Apple Music?",
      answer:
        "Same idea, streaming your music, except your subscription goes directly to the artists you actually listen to, in proportion to how much you listen to them. If you want your money to matter to the artists you love, this is a more direct way to do it.",
    },
    {
      question: "What's the Day One offer?",
      answer:
        "The first 1,000 listeners, the Day Ones, get RAAYDR at £6.99 a month, locked in forever. After that it's £9.99.",
    },
    {
      question:
        "Does my subscription go to every artist on the platform or just the ones I listen to?",
      answer:
        "Just the artists, songwriters, producers and tastemakers you actually listen to and engage with, split by your attention share across them.",
    },
    {
      question: "Is there a free plan?",
      answer:
        "No. Playing music requires a subscription. That is deliberate: it is what makes fake accounts pointless here, because a subscription costs more than any account could ever extract.",
    },
    {
      question: "Do listeners need RAAYDR+?",
      answer:
        "No. RAAYDR+ is a creator tool. There is nothing in it for listeners and nothing about your listening is behind it.",
    },
    {
      question: "Can I cancel any time?",
      answer:
        "Yes, it's a standard monthly subscription with no lock in beyond keeping your Day One price for as long as you stay subscribed.",
    },
  ],

  about: [
    {
      question: "Why was RAAYDR started?",
      answer:
        "Because the standard streaming model pays artists fractions of a penny no matter how much a real fan listens, and that gap between listener love and artist income felt worth fixing directly.",
    },
    {
      question: "Is RAAYDR backed by a major label or platform?",
      answer:
        "No, RAAYDR is independent, built specifically to work for independent artists and the people who support them without a major label layer in between.",
    },
  ],
};

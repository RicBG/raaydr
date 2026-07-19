// FAQ content for RAAYDR site-wide accordion component.
// Keyed by page. Each page's array renders as its own FAQ section.
// Do not alter copy without sign-off, this is locked content pending page build.

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
        "Most streaming platforms pool all subscription revenue together and divide it by total plays across the whole platform, which means a fraction of a penny per stream no matter how engaged the listener is. RAAYDR pays each artist directly from each fan's subscription, based on the share of that fan's actual listening time they earn. More attention from real fans means more money, not more plays from anyone.",
    },
    {
      question: "Is RAAYDR live yet?",
      answer:
        "Not yet, we're in waitlist mode right now while we finish building the platform. Joining the waitlist locks in founding pricing and early access.",
    },
    {
      question: "What's the founding offer?",
      answer:
        "The first 1,000 listeners get RAAYDR at £5.99 a month, locked forever, instead of the standard £7.99. The first 100 artists, 100 producers and songwriters, and 50 tastemakers get RAAYDR+ free forever.",
    },
    {
      question: "Where is RAAYDR available?",
      answer:
        "RAAYDR is open worldwide for the waitlist, though our active marketing right now is focused on the UK.",
    },
    {
      question: "How do artists actually get paid on RAAYDR?",
      answer:
        "A set pool from every fan's subscription goes directly to the artists that fan listens to, split by attention share, and paid out monthly once an artist crosses the £50 threshold via Stripe Connect. You can see the numbers for yourself on the earnings calculator.",
    },
    {
      question: "Who is RAAYDR for?",
      answer:
        "Independent artists, songwriters, producers, tastemakers and the listeners who back them. Each has their own page built around how RAAYDR works specifically for them.",
    },
    {
      question: "What is a tastemaker on RAAYDR?",
      answer:
        "A tastemaker is someone whose recommendations genuinely move listeners to discover and stick with new artists, and RAAYDR pays them for that influence out of a ringfenced fund built into every subscription.",
    },
  ],

  artists: [
    {
      question: "How much can I actually earn per fan on RAAYDR?",
      answer:
        "On the founding tier, £3.50 of every £5.99 fan subscription goes into the artist pool each month, split by attention share. On the standard tier, it's £4.20 of every £7.99. A fan who gives you 40 percent of their listening time pays you 40 percent of that pool, every month, for as long as they stay subscribed.",
    },
    {
      question: "How does this compare to what I make on Spotify?",
      answer:
        "Spotify pays roughly £0.003 per stream, so an engaged fan playing your music 80 times a month is worth around 24 pence to you. The same fan on RAAYDR, at a strong attention share, is worth pounds, not pence. Run your own numbers on the calculator to see the difference at your fan count.",
    },
    {
      question: 'What counts as "attention share"?',
      answer:
        "It's the proportion of a fan's total listening time each month that goes to you specifically, out of everyone they listen to. It rewards artists who hold a fan's actual attention, not just artists who get added to a playlist and skipped.",
    },
    {
      question: "When and how do I get paid?",
      answer:
        "Payouts run monthly through Stripe Connect once your balance hits £50. There's no manual invoicing, it's automatic once you cross the threshold.",
    },
    {
      question: "What is RAAYDR+ and is it really free?",
      answer:
        "RAAYDR+ is our creator subscription with a role specific dashboard for tracking your fans, attention share and earnings in detail. It's £1.99 a month normally, but the first 100 artists get it free forever.",
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
        "You earn a share of the artist's attention based earnings for any track you're credited on, based on a split percentage you agree directly with the artist, commonly around 30 percent but entirely up to what you've negotiated. As the artist earns more from real fan attention, your cut grows with it.",
    },
    {
      question:
        "How is this different from a typical production or songwriting deal?",
      answer:
        "Right now most streaming income is so diluted per stream that agreed splits barely add up to anything. Because RAAYDR pays meaningfully more per engaged fan, the same agreed percentage translates into real, trackable monthly income.",
    },
    {
      question: "Do I set my own split percentage?",
      answer:
        "The split is whatever you and the artist agree on for that song, RAAYDR doesn't dictate it. Our calculator lets you plug in your agreed percentage to see what it means in pounds.",
    },
    {
      question: "How do I track my earnings?",
      answer:
        "RAAYDR+ gives producers and songwriters their own dashboard showing which tracks are earning, what attention share they're pulling, and what your split translates to each month.",
    },
    {
      question: "Is RAAYDR+ free for producers and songwriters?",
      answer:
        "Yes, for the first 100 producers and songwriters to join, RAAYDR+ is free forever. After that it's £1.99 a month.",
    },
    {
      question: "What's the payout threshold and method?",
      answer: "£50 minimum, paid monthly through Stripe Connect, same as artists.",
    },
  ],

  tastemakers: [
    {
      question: "What exactly is a tastemaker on RAAYDR?",
      answer:
        "Someone whose picks and playlists genuinely introduce listeners to music they stick with. If people trust your taste enough to act on it, RAAYDR pays you for that influence.",
    },
    {
      question: "How do tastemakers get paid?",
      answer:
        "Every subscription includes a ringfenced tastemaker fund, £0.99 a month on the founding tier and £1.99 on standard. That fund is split across the tastemakers each fan actually discovers and listens through, based on the same attention share model artists are paid on.",
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
        "The first 50 tastemakers to join get RAAYDR+ free forever, after that it's £1.99 a month for the full dashboard.",
    },
    {
      question: "What's the payout threshold?",
      answer:
        "£50 minimum, paid monthly via Stripe Connect, same as every other creator role.",
    },
  ],

  listeners: [
    {
      question: "Why would I pay for RAAYDR instead of Spotify or Apple Music?",
      answer:
        "Same idea, streaming your music, except your subscription goes directly to the artists you actually listen to, in proportion to how much you listen to them. If you want your money to matter to the artists you love, this is a more direct way to do it.",
    },
    {
      question: "What's the founding listener offer?",
      answer:
        "The first 1,000 listeners get RAAYDR at £5.99 a month, locked in forever. After that it's £7.99.",
    },
    {
      question:
        "Does my subscription go to every artist on the platform or just the ones I listen to?",
      answer:
        "Just the artists, songwriters, producers and tastemakers you actually listen to and engage with, split by your attention share across them.",
    },
    {
      question: "Is RAAYDR available where I live?",
      answer:
        "Yes, the waitlist is open worldwide, our early marketing push is UK focused but anyone can join.",
    },
    {
      question: "Do I need to do anything special for my listening to count?",
      answer:
        "No, just listen the way you normally would. Attention share is calculated automatically from your listening activity.",
    },
    {
      question: "Can I cancel any time?",
      answer:
        "Yes, it's a standard monthly subscription with no lock in beyond keeping your founding price for as long as you stay subscribed.",
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

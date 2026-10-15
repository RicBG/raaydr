/**
 * Sat 17 Oct 2026, 19:00 UK, @raaydrmusic: "Things nobody tells you about buying streams".
 *
 * The first reel of the 16 to 29 October plan to be built as something Ric can watch
 * before anything is rendered. Copy is board row 3308's Sat 17 line, corrected on row
 * 3539, word for word: a preview that paraphrases the plan is a preview of something
 * else. Every figure-free claim here is already on raaydr.com, in
 * `content/pulse/can-you-buy-spotify-streams.md`, which is where the pinned comment's
 * DM sends people.
 *
 * Format F2 (row 3308): a hook card, numbered cards, and a CTA card last. Timings are
 * seconds from the start of the loop. Everything on screen is a function of that
 * clock, so the preview and any later render agree.
 *
 * The music is NOT here, on purpose. Row 3360: the track (One For Dilla, Otis
 * McDonald) comes from Instagram's own catalogue and is attached at scheduling, with
 * the reel's own volume at zero. So the file that gets rendered is silent and this
 * preview is silent, and that is correct rather than missing.
 */

export type ReelCard = {
  /** Space Mono eyebrow above the line. */
  eyebrow: string;
  /** The line itself, Clash Display. `\n` is a deliberate break. */
  line: string;
  /** Seconds into the loop the card starts entering. */
  at: number;
  /** Seconds into the loop the card starts leaving. */
  until: number;
};

export const SAT_17_REEL = {
  slug: "sat-17",
  day: "Sat 17 Oct 2026",
  slot: "19:00 UK",
  account: "@raaydrmusic",
  format: "F2",
  background: "halo-artists",
  /** Row 3360. Attached in Instagram at scheduling, not in the file. */
  track: { title: "One For Dilla", artist: "Otis McDonald", audioId: "928787084485000" },
  pinnedComment: "Comment RAAYDR and we'll DM you the link",
  caption:
    "Bot farms run on play counts. We took the play counts away. Comment RAAYDR for the full read.",
  dmLink: "/pulse/can-you-buy-spotify-streams",
  /** The whole loop, in seconds. The CTA holds until here, then it starts again. */
  duration: 24,
  hook: {
    eyebrow: "From Pulse",
    line: "Things nobody tells you about buying streams",
    at: 0,
    until: 2.9,
  } satisfies ReelCard,
  cards: [
    { eyebrow: "01 / 05", line: "Yes, you can buy them.", at: 3.2, until: 5.9 },
    { eyebrow: "02 / 05", line: "Bot farms run on play counts.", at: 6.2, until: 9.0 },
    {
      eyebrow: "03 / 05",
      line: "Bought plays dilute the pot real fans pay into.",
      at: 9.3,
      until: 12.7,
    },
    {
      eyebrow: "04 / 05",
      line: "RAAYDR shows no public play counts at all.",
      at: 13.0,
      until: 16.0,
    },
    { eyebrow: "05 / 05", line: "Nothing to fake.", at: 16.3, until: 18.6 },
  ] satisfies ReelCard[],
  cta: {
    eyebrow: "Comment for the link",
    line: "Comment RAAYDR",
    sub: "and we'll DM you the full read.",
    url: "raaydr.com",
    at: 18.9,
    until: 23.6,
  },
} as const;

/** Words that must never appear on screen. Row 3539: Day One is the only cohort word. */
export const BANNED_ON_SCREEN = ["founding", "first platform", "the first"] as const;

/** Every piece of copy a viewer can read, for the guards. */
export function allReelCopy(): string[] {
  const r = SAT_17_REEL;
  return [
    r.hook.eyebrow,
    r.hook.line,
    ...r.cards.flatMap((c) => [c.eyebrow, c.line]),
    r.cta.eyebrow,
    r.cta.line,
    r.cta.sub,
    r.caption,
    r.pinnedComment,
  ];
}

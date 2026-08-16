// The How It Works cards: one source for the four-card bento on the homepage.
//
// Same pattern as lib/pledges.ts. The copy, the destination, the image and the
// analytics name all live on one record, so a card cannot end up pointing at
// one audience while saying another's line, and any future reuse of these
// cards reads the same text.
//
// Copy rules: the only figure anywhere in this section is £9.99, the published
// price, and it appears once, in the strip below the grid. No other numbers,
// and no em dashes or en dashes.

export type HowItWorksRole = "listeners" | "artists" | "tastemakers" | "credits";

export type HowItWorksCard = {
  /** Drives the CSS role class, the analytics event name and the React key. */
  role: HowItWorksRole;
  headline: string;
  body: string;
  /** Visible on the card at all times: nothing here depends on hover. */
  cta: string;
  href: string;
  image: string;
  /** Empty when the image is decorative and the headline already carries the
   *  meaning. These images are all scene-setting rather than informational, so
   *  they are described for what they show, not what they mean. */
  alt: string;
};

export const HOW_IT_WORKS_CARDS: HowItWorksCard[] = [
  {
    role: "listeners",
    headline: "Your favourite artist knows your name.",
    body: "Rate, save and share to push tracks up. Points unlock early drops and access. Artists see exactly who got them there.",
    cta: "For listeners",
    href: "/for-listeners",
    image: "/how-it-works/hiw-listeners.webp",
    alt: "A listener at night, eyes closed, earphones in, city lights behind her.",
  },
  {
    role: "artists",
    headline: "Artists get paid attention.",
    body: "See the actual people listening. Real fans fund you monthly, splits sorted the day you upload. No label. No gatekeeper.",
    cta: "For artists",
    href: "/artists",
    image: "/how-it-works/hiw-artists.webp",
    alt: "An artist in profile, silhouetted against a pale field.",
  },
  {
    role: "tastemakers",
    headline: "Tastemakers curate.",
    body: "Reputations on the line. No algorithm.",
    cta: "For tastemakers",
    href: "/tastemakers",
    image: "/how-it-works/hiw-tastemakers.webp",
    alt: "Digging through record crates in a lamplit shop.",
  },
  {
    role: "credits",
    headline: "Credits get paid.",
    body: "On a released track? Claim your credit and earn from it every month.",
    cta: "For producers and songwriters",
    href: "/producers-songwriters",
    image: "/how-it-works/hiw-credits.webp",
    alt: "Hands playing a drum machine beside a lamp.",
  },
];

/** The quiet strip under the grid: the one place a figure appears. */
export const HOW_IT_WORKS_STRIP = {
  text: "Everyone above gets paid from one subscription.",
  linkLabel: "Where the £9.99 goes",
  href: "/pulse/where-your-9-99-actually-goes",
};

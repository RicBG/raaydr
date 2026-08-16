// The RAAYDR pledges: the promises the marketing site puts in writing.
//
// One source for two renderings, so the homepage timeline and the full
// /artists section can never drift apart. `big` + `short` carry the homepage
// panels; `title` + `body` is the full first person version on /artists, and
// the title doubles as the timeline panel's label. The homepage deep links
// into the /artists section through PLEDGE_HREF, which is built from
// PLEDGE_ANCHOR, so the link and the id it targets move together.
//
// Copy rules (same as lib/faqData.ts): no standalone pound figures, no split
// percentages, and no em dashes or en dashes anywhere.
//
// These pledges are marketing commitments, and /terms is expected to carry
// matching clauses when it gets real content. If a pledge changes here, the
// contract has to change with it, never the other way round.

export type Pledge = {
  /** Homepage timeline: the poster word, set at display size. */
  big: string;
  /** Homepage timeline: third person, one line. */
  short: string;
  /** The promise itself: /artists, and the timeline panel label. */
  title: string;
  /** What the promise actually means: /artists, and the timeline panel body. */
  body: string;
  /** Panel wash on the homepage timeline. One of the spectrum tokens, kept as
   *  a literal hex because it is read into color-mix() and radial-gradient()
   *  through an inline custom property, not resolved from the token. */
  accent: string;
};

export const PLEDGE_HEADING = "Some things we'll put in writing.";

/** The id on the /artists pledge section, and the target of the home deep link. */
export const PLEDGE_ANCHOR = "pledges";

/** Deep link from the homepage bar into the full section on /artists. */
export const PLEDGE_HREF = `/artists#${PLEDGE_ANCHOR}`;

export const PLEDGE_LINK_TEXT = "Read the full promises";

export const PLEDGES: Pledge[] = [
  {
    big: "Yours",
    short: "Artists keep their music.",
    title: "Your music stays yours.",
    body: "Your masters, your rights, your catalogue. Uploading gives us permission to stream it to subscribers. That's the whole deal.",
    accent: "#EBA83A", // --amber, the artists colour
  },
  {
    big: "Never",
    short: "It never trains AI.",
    title: "Never used to train AI.",
    body: "We will never train AI on your music, and we will never license it to anyone who would.",
    accent: "#E585AC", // --orchid
  },
  {
    big: "Free",
    short: "Uploading is free.",
    title: "Uploading is free.",
    body: "It costs nothing to put your music on RAAYDR, and it never will.",
    accent: "#3BCE7B", // --green
  },
  {
    big: "Monthly",
    short: "The artist money moves monthly.",
    title: "The artist money always moves.",
    body: "Every fan's subscription follows their own listening, and the artist money in it reaches the artists they play. Monthly. We don't sit on it and we don't absorb what goes unplayed.",
    accent: "#8C7AE6", // --violet, the money colour
  },
];

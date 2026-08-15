// The RAAYDR pledges: the promises the marketing site puts in writing.
//
// One source for two renderings, so the compact homepage bar and the full
// /artists section can never drift apart. `short` is the third person one
// liner used on the homepage; `title` + `body` is the full first person
// version on /artists. The homepage bar deep links into the /artists section
// through PLEDGE_HREF, which is built from PLEDGE_ANCHOR, so the link and the
// id it targets move together.
//
// Copy rules (same as lib/faqData.ts): no standalone pound figures, no split
// percentages, and no em dashes or en dashes anywhere.
//
// These pledges are marketing commitments, and /terms is expected to carry
// matching clauses when it gets real content. If a pledge changes here, the
// contract has to change with it, never the other way round.

export type Pledge = {
  /** Homepage bar: third person, one line. */
  short: string;
  /** /artists: the promise itself. */
  title: string;
  /** /artists: what the promise actually means. */
  body: string;
};

export const PLEDGE_HEADING = "Some things we'll put in writing.";

/** The id on the /artists pledge section, and the target of the home deep link. */
export const PLEDGE_ANCHOR = "pledges";

/** Deep link from the homepage bar into the full section on /artists. */
export const PLEDGE_HREF = `/artists#${PLEDGE_ANCHOR}`;

export const PLEDGE_LINK_TEXT = "Read the full promises";

export const PLEDGES: Pledge[] = [
  {
    short: "Artists keep their music.",
    title: "Your music stays yours.",
    body: "Your masters, your rights, your catalogue. Uploading gives us permission to stream it to subscribers. That's the whole deal.",
  },
  {
    short: "It never trains AI.",
    title: "Never used to train AI.",
    body: "We will never train AI on your music, and we will never license it to anyone who would.",
  },
  {
    short: "Uploading is free.",
    title: "Uploading is free.",
    body: "It costs nothing to put your music on RAAYDR, and it never will.",
  },
  {
    short: "The artist money moves monthly.",
    title: "The artist money always moves.",
    body: "Every fan's subscription follows their own listening, and the artist money in it reaches the artists they play. Monthly. We don't sit on it and we don't absorb what goes unplayed.",
  },
];

import type { SVGProps } from "react";

// Minimal single-colour line icons (stroke: currentColor, no fill, no brand
// colour) so they inherit whatever text/icon colour the surrounding context
// uses. Shared by the footer and the About "Follow the build" banner.

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <line x1="16.6" y1="7.4" x2="16.61" y2="7.4" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
    </svg>
  );
}

/*
 * THE THREADS MARK, AND IT IS DRAWN RATHER THAN SUPPLIED.
 *
 * Board row 5348. Neither this repository nor the platform held a Threads icon, so this path was
 * written here. **It is an approximation of the official mark and nobody who can see it has
 * looked at it yet.** This session cannot open the rendered page, so saying it "matches" would
 * be a claim about something it has not seen, which is exactly what Ric's 4 November ruling
 * exists to stop.
 *
 * So it is flagged on the board for `claude-chat` to check beside the real mark at 390 and 1440,
 * with the two existing icons for scale. If it reads wrong, the fix is this one path.
 *
 * Shaped to match its neighbours rather than the brand sheet: a 24 unit box, `currentColor`, and
 * stroke geometry so it carries the same visual weight as the Instagram glyph next to it instead
 * of sitting heavier as a filled logo would.
 */
export function ThreadsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* The outer loop: the mark's open ring, broken at the lower right where the tail leaves. */}
      <path d="M16.8 4.6A8.2 8.2 0 0 0 12 3.2C6.9 3.2 3.8 6.6 3.8 12S6.9 20.8 12 20.8c3.6 0 6.1-1.7 7.1-4.4" />
      {/* The inner hook: the stroke that curls back under the centre and gives the mark its eye. */}
      <path d="M8.6 14.3c.5 1.6 2 2.4 3.6 2.3 2.1-.2 3.3-1.6 3.3-3.6 0-2.4-1.9-3.7-4.4-3.7-1.3 0-2.4.3-3.2.9" />
      <path d="M15.5 13c1.9.3 3.1 1.3 3.3 2.9" />
    </svg>
  );
}

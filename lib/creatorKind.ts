// Which kind of creator a "Songwriter or Producer" is. Board rows 3376 and 3383.
//
// The role itself stays `songwriter_producer`, so nothing that checks the role
// breaks. This is the one extra tap that lets the back end count producers and
// songwriters as two audiences. Safe to import from client and server.

export const CREATOR_KIND_SLUGS = ["producer", "songwriter", "both"] as const;

export type CreatorKindSlug = (typeof CREATOR_KIND_SLUGS)[number];

/** Labels in display order, with the slug the API stores. */
export const CREATOR_KIND_OPTIONS: ReadonlyArray<{
  slug: CreatorKindSlug;
  label: string;
}> = [
  { slug: "producer", label: "Producer" },
  { slug: "songwriter", label: "Songwriter" },
  { slug: "both", label: "Both" },
];

/** Runtime guard usable with a plain string (e.g. request body). */
export function isCreatorKindSlug(value: string): value is CreatorKindSlug {
  return (CREATOR_KIND_SLUGS as readonly string[]).includes(value);
}

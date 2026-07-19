// Waitlist role values. Safe to import from both client and server code — it
// contains no secrets.
//
// The database (and the API route) store/validate the SLUG form. The forms
// show human-readable LABELS. Keep the two in sync here.

/** The only role values the API route and `waitlist_signups.role` accept. */
export const WAITLIST_ROLE_SLUGS = [
  "listener",
  "artist",
  "songwriter_producer",
  "tastemaker",
] as const;

export type WaitlistRoleSlug = (typeof WAITLIST_ROLE_SLUGS)[number];

/** The human-readable labels shown in the forms, in display order. */
export const WAITLIST_ROLE_LABELS = [
  "Listener",
  "Artist",
  "Songwriter or Producer",
  "Tastemaker",
] as const;

export type WaitlistRoleLabel = (typeof WAITLIST_ROLE_LABELS)[number];

/** UI label -> DB slug. */
export const ROLE_LABEL_TO_SLUG: Record<WaitlistRoleLabel, WaitlistRoleSlug> = {
  Listener: "listener",
  Artist: "artist",
  "Songwriter or Producer": "songwriter_producer",
  Tastemaker: "tastemaker",
};

/** Runtime guard usable with a plain string (e.g. request body). */
export function isWaitlistRoleSlug(value: string): value is WaitlistRoleSlug {
  return (WAITLIST_ROLE_SLUGS as readonly string[]).includes(value);
}

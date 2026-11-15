import { applyUrl } from "@/lib/siteConfig";
import type { WaitlistRoleSlug } from "@/lib/waitlistRoles";

/**
 * WHICH ROLES APPLY INSTEAD OF JOINING A LIST. Board row 6063, Ric, 15 November: Vanessa picked Tastemaker on
 * /for-listeners and joined the waitlist, so she never reached the platform's approval screen and Ric had no links to review.
 * #112 moved /tastemakers to "Apply to join" but the shared `WaitlistForm` kept the Tastemaker pill on every OTHER page, and a
 * pill that writes a list row is a way to be a tastemaker that nobody reviews. So the rule lives here, keyed on the role and not
 * on the page: pick Tastemaker on ANY form and you are sent to the application, and nothing is written to the waitlist.
 *
 * ARTISTS ARE NOT IN THIS LIST ON PURPOSE. An artist on this form already files an application (`submitArtistApplication`, straight
 * from the browser, see `siteConfig`), which is why artists produced both an application and an acknowledgement on every signup
 * measured since 7 November. The only case where an artist joins a list is a build with the platform variables unset
 * (`applicationsConfigured()` false), which production is not.
 *
 * Listener and Songwriter or Producer stay on the waitlist (Ric, 29 October for listeners; producers have no application yet).
 */
export function applicationUrlFor(slug: WaitlistRoleSlug): string | null {
  return slug === "tastemaker" ? applyUrl.tastemaker : null;
}

// The post-signup handoff: which page each role lands on, and the URL flag that
// marks that traffic.
//
// Role page views are a real signal of interest in their own right, so signup
// traffic has to be separable in GA rather than quietly inflating them. The
// flag rides in the query string, which means it is on the page_location of the
// page_view GA fires on arrival and can be segmented on directly.

import type { WaitlistRoleSlug } from "./waitlistRoles";

/** Query flag marking a role page view that came from a completed signup. */
export const JOINED_PARAM = "joined";
export const JOINED_VALUE = "1";

/** Where each role lands after signing up. */
export const ROLE_SLUG_TO_PAGE: Record<WaitlistRoleSlug, string> = {
  listener: "/for-listeners",
  artist: "/artists",
  songwriter_producer: "/producers-songwriters",
  tastemaker: "/tastemakers",
};

/** The full post-signup destination for a role, flag attached. */
export function joinedDestination(role: WaitlistRoleSlug): string {
  return `${ROLE_SLUG_TO_PAGE[role]}?${JOINED_PARAM}=${JOINED_VALUE}`;
}

/**
 * How long to hold before replacing the document, so the GA4 sign_up and Meta
 * Lead beacons get out first.
 *
 * Both tags prefer sendBeacon, which survives navigation, but neither
 * guarantees it, and a dropped sign_up is an invisible failure. The server side
 * Conversions API Lead is unaffected either way: it is already sent by the API
 * route before this runs.
 */
export const ANALYTICS_FLUSH_MS = 250;

/**
 * Pre-paint flag script. Runs in <head>, before first paint, and stamps the
 * document so CSS can cover the page instantly.
 *
 * Without this the modal would only mount after hydration, so the visitor would
 * see the role page for a beat first. On a signup confirmation that reads as a
 * failed submit, which is the one impression this flow cannot give.
 */
export const JOINED_PREPAINT_SCRIPT = `try{if(location.search.indexOf('${JOINED_PARAM}=${JOINED_VALUE}')>-1){document.documentElement.setAttribute('data-joined','1')}}catch(e){}`;

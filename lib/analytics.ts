// Client-side analytics helpers. Each call fires the same intent to BOTH
// GA4 (window.gtag) and the Meta Pixel (window.fbq) so the two stay in sync
// from one place. Every call is a no-op when the tag isn't present (SSR, an
// ad blocker, tags still loading), so callers never have to guard.

import type { WaitlistRoleSlug } from "@/lib/waitlistRoles";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

/**
 * NEVER SEND A GA4 EVENT PARAMETER NAMED `source`, `medium` OR `campaign`.
 *
 * GA4 folds those names into its manual campaign dimensions. Between roughly
 * 27 July and 1 August 2026 these events sent a parameter named `source`
 * carrying our own form labels, and GA4 reported "homepage-mid",
 * "homepage-bottom", "page" and "nav" as session_manual_source: about 21
 * sessions in seven days, none of which converted, because arriving campaign
 * values restart acquisition and detach the visitor from the campaign that
 * actually brought them.
 *
 * The tell was "page". It is a literal in WaitlistCtaTracker and appears in no
 * URL anywhere on the site, so no link could have carried it. Nothing in this
 * repo has ever appended a utm_ parameter to an internal link.
 *
 * GA4 therefore uses `cta_placement`. Meta keeps `source`: it has no reserved
 * name collision, and renaming it would break Meta reporting continuity for no
 * benefit. The two deliberately differ; that is not an oversight.
 */

/** A CTA that jumps to the waitlist form was clicked (e.g. the nav/hero "Join"
 *  button). `placement` says roughly where it was clicked from. */
export function trackWaitlistCtaClick(placement: string) {
  gtag("event", "waitlist_cta_click", { cta_placement: placement });
  fbq("trackCustom", "WaitlistCtaClick", { source: placement });
}

/** A How It Works card was clicked. `card` is the card's role name, so the
 *  four read as one event with four values rather than four events.
 *  cta_placement, not source, for the reason in the warning above. */
export function trackHowItWorksCardClick(card: string) {
  gtag("event", "how_it_works_card_click", {
    card,
    cta_placement: "how-it-works",
  });
  fbq("trackCustom", "HowItWorksCardClick", {
    card,
    source: "how-it-works",
  });
}

/** The visitor started filling the waitlist form (first field interaction).
 *  Paired with the signup event, this gives the started-vs-completed funnel. */
export function trackWaitlistStart(placement: string) {
  gtag("event", "waitlist_start", { cta_placement: placement });
  fbq("trackCustom", "WaitlistStart", { source: placement });
}

/** A waitlist signup succeeded — the conversion. `eventId` is echoed to the
 *  server-side Conversions API "Lead" event so Meta counts the two as one. */
export function trackSignup(params: {
  role: WaitlistRoleSlug;
  source: string;
  eventId: string;
  /** This session's captured campaign, if any. Lets a GA4 conversion be
   *  reconciled against the database row rather than read as a separate
   *  story. */
  utmSource?: string;
  utmCampaign?: string;
}) {
  const { role, source, eventId, utmSource, utmCampaign } = params;
  // GA4 recommended "sign_up" event — mark it as a key event in the GA4 UI.
  // cta_placement, not source: see the warning above this file's trackers.
  //
  // The campaign values are prefixed attr_ for the same reason. They are our
  // record of what we captured, not an instruction to GA4 about how to
  // attribute the session, and a bare utm_ prefix sits close enough to GA4's
  // campaign vocabulary that it is not worth the risk of finding out.
  gtag("event", "sign_up", {
    method: "waitlist",
    role,
    cta_placement: source,
    ...(utmSource ? { attr_utm_source: utmSource } : {}),
    ...(utmCampaign ? { attr_utm_campaign: utmCampaign } : {}),
  });
  // Meta standard "Lead" event; eventID matches the CAPI event for dedup.
  // Meta has no reserved name collision, so these keep the plain names.
  fbq(
    "track",
    "Lead",
    {
      content_category: role,
      source,
      ...(utmSource ? { utm_source: utmSource } : {}),
      ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    },
    { eventID: eventId }
  );
}

/** A collision-resistant id shared between the browser Pixel event and the
 *  server Conversions API event so Meta deduplicates them. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Reads Meta's _fbp / _fbc browser cookies (set by the Pixel) so they can be
 *  forwarded to the Conversions API — the single biggest match-quality lift. */
export function getMetaBrowserIds(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};
  const read = (name: string) =>
    document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=");
  return { fbp: read("_fbp"), fbc: read("_fbc") };
}

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

/** A CTA that jumps to the waitlist form was clicked (e.g. the nav/hero "Join"
 *  button). `source` says roughly where it was clicked from. */
export function trackWaitlistCtaClick(source: string) {
  gtag("event", "waitlist_cta_click", { source });
  fbq("trackCustom", "WaitlistCtaClick", { source });
}

/** The visitor started filling the waitlist form (first field interaction).
 *  Paired with the signup event, this gives the started-vs-completed funnel. */
export function trackWaitlistStart(source: string) {
  gtag("event", "waitlist_start", { source });
  fbq("trackCustom", "WaitlistStart", { source });
}

/** A waitlist signup succeeded — the conversion. `eventId` is echoed to the
 *  server-side Conversions API "Lead" event so Meta counts the two as one. */
export function trackSignup(params: {
  role: WaitlistRoleSlug;
  source: string;
  eventId: string;
}) {
  const { role, source, eventId } = params;
  // GA4 recommended "sign_up" event — mark it as a key event in the GA4 UI.
  gtag("event", "sign_up", { method: "waitlist", role, source });
  // Meta standard "Lead" event; eventID matches the CAPI event for dedup.
  fbq("track", "Lead", { content_category: role, source }, { eventID: eventId });
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

"use client";

import { useEffect } from "react";
import { trackWaitlistCtaClick } from "@/lib/analytics";

/**
 * One delegated click listener for every CTA that jumps to the waitlist form
 * (links whose href targets #join / #waitlist). Fires a waitlist_cta_click
 * event without wiring an onClick into each button — and without turning the
 * server components that render those links (Nav, Hero, About) into client
 * ones. The tracked "source" is a coarse where-from: nav vs. in-page.
 */
export default function WaitlistCtaTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.<HTMLAnchorElement>(
        'a[href*="#join"], a[href*="#waitlist"]'
      );
      if (!link) return;
      const source = link.closest("header, nav") ? "nav" : "page";
      trackWaitlistCtaClick(source);
    }
    // Capture phase so we still see the click if something stops propagation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

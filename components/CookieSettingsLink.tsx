"use client";

import { reopenConsent } from "@/lib/consent";

/** Footer control that brings the cookie banner back (see reopenConsent). */
export default function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => reopenConsent()}>
      Cookie settings
    </button>
  );
}

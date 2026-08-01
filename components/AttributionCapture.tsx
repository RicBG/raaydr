"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Captures where this session came from, once, on the first page load.
 *
 * Mounted in the root layout so it runs on every entry point, including the
 * role pages people are sent to directly from ads. captureAttribution is a
 * no-op once the session already has a value, so mounting it globally costs a
 * sessionStorage read per navigation and nothing else.
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}

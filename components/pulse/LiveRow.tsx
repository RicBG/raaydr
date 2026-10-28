"use client";

import type { ReactNode } from "react";
import { useDayOnePlacesRemain } from "@/components/useDayOnePlacesRemain";

/**
 * A table row that exists only while Day One places remain. The Pulse table row that quotes the
 * Day One price is the offer itself, so with the platform silent, or places gone, it is not drawn
 * at all rather than drawn with its price. Board rows 2965 and 2967.
 */
export default function LiveRow({ children }: { children: ReactNode }) {
  return useDayOnePlacesRemain() ? <tr>{children}</tr> : null;
}

"use client";

import type { ReactNode } from "react";
import { useDayOnePlacesRemain } from "./useDayOnePlacesRemain";

/**
 * Shows `open` only when the platform has said places remain, and `closed` in every other case:
 * no answer yet, an error, a timeout, JavaScript off, a crawler. Board rows 2965 and 2967.
 *
 * The static HTML therefore ships the CLOSED wording, which is the strongest form of the
 * guarantee: a page that cannot reach the platform must not be selling a place.
 *
 * It renders a `span` so it can sit inside a paragraph, and carries `data-state` so a test or a
 * capture can read which wording is showing without parsing the sentence.
 */
export default function DayOneOffer({
  open,
  closed,
}: {
  open: ReactNode;
  closed: ReactNode;
}) {
  const remain = useDayOnePlacesRemain();
  return <span data-state={remain ? "open" : "closed"}>{remain ? open : closed}</span>;
}

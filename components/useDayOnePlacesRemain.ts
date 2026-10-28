"use client";

import { useEffect, useState } from "react";
import { dayOnePlacesRemain } from "@/lib/platformSupabase";

/**
 * Whether Day One listener places remain, read at view time and FAILING CLOSED: it starts `false`
 * and becomes `true` only on an explicit `true` from the platform. Board rows 2965 and 2967.
 *
 * Every surface that sells a place calls this, and a page can mount several (the closing section,
 * two waitlist forms, a FAQ). They share the request that is already in flight rather than each
 * asking, and the shared promise is dropped the moment it settles, so nothing is cached: a
 * later navigation asks again. That is not caching an answer, it is not asking twice at once.
 */
let inflight: Promise<boolean> | null = null;

function ask(): Promise<boolean> {
  if (!inflight) {
    inflight = dayOnePlacesRemain().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export function useDayOnePlacesRemain(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void ask().then((remain) => {
      if (!cancelled && remain) setOpen(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return open;
}

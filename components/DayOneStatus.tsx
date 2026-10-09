"use client";

import { useEffect, useState } from "react";
import { PRICING } from "@/lib/raaydrRates";
import { dayOnePlacesRemain } from "@/lib/platformSupabase";
import styles from "./DayOneStatus.module.css";

/**
 * One live line saying whether Day One listener places are still open.
 *
 * Board rows 2962 and 2965, ruled by `claude-chat`; Ric's go on 2967, in his
 * words: "Yes, get the site in line with whatever wording needs to be
 * correct." `work_items` 225.
 *
 * ===========================================================================
 * IT STARTS CLOSED AND IS ONLY OPENED BY AN ANSWER
 * ===========================================================================
 *
 * The initial state is the CLOSED wording, not a spinner and not an empty
 * space, and that is the ruling rather than a convenience. **A page that
 * cannot reach the platform must not be selling a place.** So the offer
 * appears only when `day_one_listener_places_remain()` has answered `true`,
 * and every other outcome -- an error, a timeout, a missing variable, no
 * answer at all, JavaScript switched off, a crawler reading the static HTML --
 * leaves the closed wording in place.
 *
 * That means a visitor can briefly read the closed wording while the answer is
 * in flight, and a search engine indexing this page will see it. Both were
 * weighed and accepted: showing the offer when places have gone sells somebody
 * a place that does not exist, and showing the closed wording when places
 * remain costs one listener who reads the standard price instead. The two
 * mistakes are not the same size.
 *
 * ===========================================================================
 * HOW THIS DIFFERS FROM `AuthInfoPanel` ON THE PLATFORM, WHICH IT WAS ASKED
 * TO MATCH
 * ===========================================================================
 *
 * Row 2965 says this "matches `AuthInfoPanel` on the platform, so both sites
 * behave the same". It does not, quite, and the difference is recorded here
 * rather than smoothed over. `AuthInfoPanel` fails QUIET: on a null or an
 * error it renders nothing, because it is a stat beside a signup form and an
 * error message on the page somebody is joining from is worse than a missing
 * line. This one fails CLOSED, because it is the offer itself on a marketing
 * page, and a missing line here would leave the surrounding prose selling a
 * price with nothing to qualify it.
 *
 * Both read the same function, both refuse to invent a number, and neither
 * ever shows a count. Where they differ, the ruling's own words -- "fails
 * closed ... never the offer" -- are what this follows.
 */
export default function DayOneStatus() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void dayOnePlacesRemain().then((remain) => {
      if (!cancelled && remain) setOpen(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <p
      className={styles.status}
      data-state={open ? "open" : "closed"}
      // The line replaces itself once the platform answers, so a screen reader
      // that has already read the closed wording is told it changed.
      aria-live="polite"
    >
      {open ? (
        <>
          <strong>Day One is open.</strong> The first {PRICING.dayOneCap}{" "}
          listeners pay £{PRICING.dayOne} a month, locked forever, even if they
          cancel and come back. After that, RAAYDR is £{PRICING.standard}.
        </>
      ) : (
        <>
          <strong>Day One is closed.</strong> All {PRICING.dayOneCap} Day One
          places have gone. RAAYDR is £{PRICING.standard} a month, and everything
          else on this page is unchanged.
        </>
      )}
    </p>
  );
}

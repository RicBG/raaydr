"use client";

import { useCallback, useEffect, useState } from "react";
import { APPLIED_PARAM, APPLIED_VALUE, JOINED_PARAM, JOINED_VALUE } from "@/lib/joined";
import styles from "./JoinedModal.module.css";

const INSTAGRAM = "https://instagram.com/raaydrmusic";

/**
 * Signup confirmation, shown on arrival at the role page the visitor was sent
 * to after joining the waitlist.
 *
 * Mounted once in the root layout rather than on each role page, so the role
 * pages themselves are untouched and any page can receive the handoff.
 *
 * The backdrop is already on screen before this mounts: the pre-paint script in
 * <head> stamps data-joined on <html> and CSS covers the page from the first
 * frame. This component fills that cover in with the real modal. Removing the
 * attribute is what tears the cover down, so it happens on dismiss, never on
 * mount.
 */
export default function JoinedModal() {
  /*
   * Whether the modal is up, and whether the person APPLIED rather than joined
   * a waitlist (board row 1030). The modal is mounted once in the root layout
   * and has no other way to know which happened: the form sets the second flag
   * on the destination when, and only when, it actually sent an application.
   *
   * ONE piece of state holding both, rather than two. They are read from the
   * same URL in the same breath and always change together, and a second
   * setState in this effect would be a second cascading render for something
   * that is one fact.
   */
  const [entry, setEntry] = useState({ open: false, applied: false });
  const { open, applied } = entry;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(JOINED_PARAM) === JOINED_VALUE) {
      setEntry({ open: true, applied: params.get(APPLIED_PARAM) === APPLIED_VALUE });
    }
  }, []);

  const close = useCallback(() => {
    setEntry((e) => ({ ...e, open: false }));
    document.documentElement.removeAttribute("data-joined");
    // Drop the flag so a refresh or a shared link does not replay the modal.
    // replaceState, not pushState: this must not add a history entry. GA has
    // already read the flagged URL on the page_view fired at load.
    const url = new URL(window.location.href);
    url.searchParams.delete(JOINED_PARAM);
    url.searchParams.delete(APPLIED_PARAM);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // Hold the page still behind the modal. Mobile Safari will otherwise scroll
    // the body under the overlay when the visitor drags on the backdrop.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="joined-title"
      onClick={close}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.dismiss}
          onClick={close}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        {/*
         * AN APPLICANT IS NOT "IN" AND IS NOT PROMISED A CODE.
         *
         * Ruled by Ric on board row 1030. Ric reads every application and some
         * are refused, so "You're in" and "We'll email you before launch with
         * your access code" are both claims this platform cannot keep for
         * somebody who has just applied.
         *
         * The wording says "if it's a fit" rather than "we'll email you either
         * way", which `claude-chat` corrected itself on before it reached the
         * code: `admin_decide_artist_application` sends nothing on a rejection
         * and no rejection email exists, so a promise of one would be a second
         * thing we do not do.
         */}
        <p id="joined-title" className={styles.title}>
          {applied ? "Application in." : "You\u2019re in."}
        </p>
        <p className={styles.line}>
          {applied
            ? "We listen to every one, and if it\u2019s a fit you\u2019ll get an invite by email."
            : "We\u2019ll email you before launch with your access code."}
        </p>
        <p className={styles.line}>
          Follow @raaydrmusic for the build in real time.
        </p>

        <a
          className={`btn ${styles.action}`}
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow on Instagram
        </a>
      </div>
    </div>
  );
}

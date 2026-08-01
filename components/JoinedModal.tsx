"use client";

import { useCallback, useEffect, useState } from "react";
import { JOINED_PARAM, JOINED_VALUE } from "@/lib/joined";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(JOINED_PARAM) === JOINED_VALUE) setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    document.documentElement.removeAttribute("data-joined");
    // Drop the flag so a refresh or a shared link does not replay the modal.
    // replaceState, not pushState: this must not add a history entry. GA has
    // already read the flagged URL on the page_view fired at load.
    const url = new URL(window.location.href);
    url.searchParams.delete(JOINED_PARAM);
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

        <p id="joined-title" className={styles.title}>
          You&rsquo;re in.
        </p>
        <p className={styles.line}>
          We&rsquo;ll email you before launch with your access code.
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

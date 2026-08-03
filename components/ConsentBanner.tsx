"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_DEFAULT,
  readConsent,
  setConsent,
  type ConsentState,
} from "@/lib/consent";
import styles from "./ConsentBanner.module.css";

/** localStorage is an external store, so it is read as one. This also gives the
 *  banner a free subscription: setConsent dispatches the change event, the
 *  snapshot flips from null to a decision, and the banner unmounts itself. */
function subscribe(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
}

/** Consent cannot be known while rendering on the server, so the server
 *  snapshot reports a decision and the banner stays out of the HTML. React
 *  re-reads the client snapshot straight after hydration, which is what
 *  actually reveals it. */
const serverSnapshot = (): ConsentState | null => CONSENT_DEFAULT;

/**
 * Cookie consent banner.
 *
 * Shown only while the visitor has not chosen. Both buttons carry equal visual
 * weight on purpose: a reject that is harder to find than an accept is not a
 * free choice, and the ICO treats it as invalid consent. That is a design
 * constraint here, not a preference.
 *
 * Renders nothing on the server and nothing until mount, so the markup never
 * disagrees between server and client. The tags are already held closed by the
 * pre-paint script by then, so nothing is tracked while this decides whether to
 * appear.
 */
export default function ConsentBanner() {
  const consent = useSyncExternalStore(subscribe, readConsent, serverSnapshot);

  const choose = useCallback((state: ConsentState) => {
    setConsent(state);
  }, []);

  // Undecided is the only state that shows the banner.
  if (consent !== null) return null;

  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p id="consent-title" className={styles.title}>
            Cookies
          </p>
          <p id="consent-body" className={styles.body}>
            We&rsquo;d like to use analytics and advertising cookies to see how
            people find RAAYDR and whether our ads are working. They are off
            until you say yes, and the site works exactly the same either way.{" "}
            <Link href="/privacy" className={styles.link}>
              Read our privacy policy
            </Link>
            .
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={() => choose("denied")}
          >
            Reject
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => choose("granted")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

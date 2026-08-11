"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  effectiveConsent,
} from "@/lib/consent";
import styles from "./CookieCheck.module.css";

/**
 * Live cookie and consent readout, for verifying tag behaviour on a real phone.
 *
 * Reads only. It sets no cookie, loads no tag and writes nothing to storage,
 * because an instrument that changes what it measures is worthless here: if
 * this page set anything, a PRESENT row would no longer prove the site did it.
 * The one exception is the second button below, which only ever deletes.
 *
 * Note that the page still inherits the root layout, so GA4 and the Meta Pixel
 * load here exactly as they do on every other page. That is deliberate — this
 * is a real page of the real site, so what it reports is what the site does,
 * not what an artificial tag-free island would do.
 *
 * Everything is read from lib/consent rather than restated, so the readout
 * cannot drift from the implementation it is checking.
 */

/** The four the check is about. GA4 sets _ga and _gid, the Pixel _fbp and _fbc. */
const TRACKED = ["_ga", "_gid", "_fbp", "_fbc"] as const;

type Snapshot = {
  /** document.cookie exactly as the browser returns it. */
  raw: string;
  /** Cookie names parsed out of it. */
  names: string[];
  /** GA4 also sets one per property, e.g. _ga_G-EG7SLYLLMY. Found, not assumed. */
  gaProperty: string[];
  /** Raw localStorage value under the real consent key. null when unset. */
  stored: string | null;
  /** True when localStorage threw, which private browsing modes do. */
  storageBlocked: boolean;
  /** What the site would act on right now, via the real resolver. */
  effective: string;
  /** The <html data-consent> stamp set by the pre-paint script. */
  htmlAttr: string | null;
  /** window.__raaydrConsent, which the Meta Pixel snippet reads. */
  windowFlag: string;
  /** "true", "false" or "undefined" — all three are distinct results. */
  gpc: string;
  /** Clock time of this read, so a frozen page is obvious. */
  at: string;
};

function read(): Snapshot {
  const raw = document.cookie;

  const names = raw
    .split(";")
    .map((part) => part.split("=")[0].trim())
    .filter(Boolean);

  let stored: string | null = null;
  let storageBlocked = false;
  try {
    stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    storageBlocked = true;
  }

  let htmlAttr: string | null = null;
  try {
    htmlAttr = document.documentElement.getAttribute("data-consent");
  } catch {
    /* no document */
  }

  // typeof, not a truthiness check: undefined is a real answer here and must
  // not be flattened into false. A browser that has never heard of GPC and one
  // that is actively sending "do not sell" are different findings.
  const gpcValue = navigator.globalPrivacyControl;
  const gpc = typeof gpcValue === "undefined" ? "undefined" : String(gpcValue);

  const flag = window.__raaydrConsent;

  return {
    raw,
    names,
    gaProperty: names.filter((n) => n.startsWith("_ga_")),
    stored,
    storageBlocked,
    effective: effectiveConsent(),
    htmlAttr,
    windowFlag: typeof flag === "undefined" ? "undefined" : String(flag),
    gpc,
    at: new Date().toLocaleTimeString(),
  };
}

/** Expire one cookie across the domain and path variants it might carry.
 *  Deleting is the only cookie write this page ever performs. */
function expire(name: string): void {
  const host = window.location.hostname;
  const parts = host.split(".");

  // GA and Meta set on the registrable domain with a leading dot; a plain
  // host-only delete misses those entirely, which is the usual reason a
  // "cleared" cookie reappears on the next read.
  const domains: (string | undefined)[] = [undefined, host, `.${host}`];
  for (let i = 1; i < parts.length - 1; i += 1) {
    domains.push(`.${parts.slice(i).join(".")}`);
  }

  for (const domain of domains) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${
      domain ? `; domain=${domain}` : ""
    }`;
  }
}

export default function CookieCheck() {
  // Null until mounted. Reading document during render would disagree with the
  // server HTML; this keeps the first paint identical on both sides.
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    const tick = () => setSnap(read());
    tick();

    // Every 2s, so a change made elsewhere shows up without a reload.
    const id = window.setInterval(tick, 2000);
    // The banner dispatches this, so accepting or rejecting lands immediately
    // rather than up to two seconds later.
    window.addEventListener(CONSENT_CHANGE_EVENT, tick);

    return () => {
      window.clearInterval(id);
      window.removeEventListener(CONSENT_CHANGE_EVENT, tick);
    };
  }, []);

  const resetConsent = useCallback(() => {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      /* nothing stored to clear */
    }
    // Reload rather than re-render: the pre-paint script has to run again for
    // the site to genuinely be back in its pre-choice state.
    window.location.reload();
  }, []);

  const resetEverything = useCallback(() => {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      /* nothing stored to clear */
    }
    const names = document.cookie
      .split(";")
      .map((part) => part.split("=")[0].trim())
      .filter((n) => n.startsWith("_ga") || n.startsWith("_fb"));
    for (const name of new Set([...TRACKED, ...names])) expire(name);
    window.location.reload();
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Cookie check</h1>
        <p className={styles.sub}>
          Temporary diagnostic page. Re-reads every 2 seconds. Sets no cookies
          and loads no tags of its own.
        </p>

        {snap === null ? (
          <p className={styles.waiting}>Reading&hellip;</p>
        ) : (
          <>
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Tracking cookies</h2>
              <ul className={styles.rows}>
                {TRACKED.map((name) => {
                  const present = snap.names.includes(name);
                  return (
                    <li key={name} className={styles.row}>
                      <span className={styles.rowName}>{name}</span>
                      <span
                        className={`${styles.badge} ${
                          present ? styles.present : styles.absent
                        }`}
                      >
                        {present ? "PRESENT" : "ABSENT"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {/* GA4 sets a per-property cookie alongside _ga. Listed because
                  it is the one that would give a leak away first. */}
              <p className={styles.note}>
                GA4 property cookie (_ga_*):{" "}
                <strong>
                  {snap.gaProperty.length
                    ? snap.gaProperty.join(", ")
                    : "none"}
                </strong>
              </p>
            </section>

            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Consent state</h2>
              <ul className={styles.rows}>
                <li className={styles.row}>
                  <span className={styles.rowName}>
                    localStorage
                    <span className={styles.rowKey}>{CONSENT_STORAGE_KEY}</span>
                  </span>
                  <span className={styles.value}>
                    {snap.storageBlocked
                      ? "BLOCKED"
                      : (snap.stored ?? "not set")}
                  </span>
                </li>
                <li className={styles.row}>
                  <span className={styles.rowName}>
                    Effective
                    <span className={styles.rowKey}>what the site acts on</span>
                  </span>
                  <span className={styles.value}>{snap.effective}</span>
                </li>
                <li className={styles.row}>
                  <span className={styles.rowName}>
                    html data-consent
                    <span className={styles.rowKey}>pre-paint script</span>
                  </span>
                  <span className={styles.value}>{snap.htmlAttr ?? "not set"}</span>
                </li>
                <li className={styles.row}>
                  <span className={styles.rowName}>
                    window.__raaydrConsent
                    <span className={styles.rowKey}>read by the Pixel</span>
                  </span>
                  <span className={styles.value}>{snap.windowFlag}</span>
                </li>
              </ul>
            </section>

            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Global Privacy Control</h2>
              <ul className={styles.rows}>
                <li className={styles.row}>
                  <span className={styles.rowName}>
                    navigator.globalPrivacyControl
                  </span>
                  <span className={styles.value}>{snap.gpc}</span>
                </li>
              </ul>
              <p className={styles.note}>
                undefined means the browser sends no signal, which is a
                different result from false.
              </p>
            </section>

            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Raw document.cookie</h2>
              <p className={styles.raw}>
                {snap.raw === "" ? "(empty string)" : snap.raw}
              </p>
            </section>

            <p className={styles.stamp}>Last read {snap.at}</p>
          </>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={resetConsent}
          >
            Reset consent and reload
          </button>
          {/* Clearing the stored choice alone leaves any _ga and _fbp already
              on the device, so the next run would read PRESENT no matter what
              was chosen. This second button is what makes the test genuinely
              repeatable on the same phone. */}
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={resetEverything}
          >
            Reset consent, clear tracking cookies and reload
          </button>
        </div>
      </div>
    </main>
  );
}

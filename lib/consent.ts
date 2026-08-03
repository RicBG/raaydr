// Cookie consent, single source of truth.
//
// The site loads GA4, the Meta Pixel and the server-side Meta Conversions API.
// Under PECR none of those may set an identifier or send a person's data before
// they say yes, so nothing here is optional decoration: it is the gate.
//
// The model is Google Consent Mode v2 with everything DENIED by default. The
// tags still load, which is what keeps GA4's conversion modelling alive for
// visitors who decline, but until consent is granted they store nothing and
// send no identifiers. Meta has its own equivalent (`fbq('consent','revoke')`)
// and is held the same way.
//
// Three surfaces have to agree or the gate leaks:
//   1. The pre-paint script below, which sets the default before gtag.js loads.
//   2. ConsentBanner, which records the choice and pushes the update.
//   3. The waitlist API route, which must not call the Conversions API without
//      consent — a server-side send bypasses everything the browser does.

/** Granted or denied. `null` means the visitor has not chosen yet. */
export type ConsentState = "granted" | "denied";

/**
 * Storage key. Versioned: if the categories we ask about ever change, bump the
 * suffix so previously stored answers to a different question are not treated
 * as answers to the new one.
 */
export const CONSENT_STORAGE_KEY = "raaydr-consent-v1";

/**
 * What consent is before the visitor chooses.
 *
 * THIS MUST STAY "denied". It is the whole legal basis of the banner: a default
 * of "granted" would mean tracking every visitor who never touched it, which is
 * the exact practice consent is meant to prevent. Changing this is not a
 * configuration tweak.
 */
export const CONSENT_DEFAULT: ConsentState = "denied";

/** Fired on the window when the choice changes, so listeners can react. */
export const CONSENT_CHANGE_EVENT = "raaydr:consent-change";

/** The Consent Mode v2 signals we set. Analytics and advertising move together
 *  because the banner asks one question; splitting them would need two. */
export const CONSENT_SIGNALS = [
  "ad_storage",
  "analytics_storage",
  "ad_user_data",
  "ad_personalization",
] as const;

/** Consent Mode payload for a given state, e.g. { ad_storage: 'denied', ... }. */
export function consentPayload(state: ConsentState): Record<string, ConsentState> {
  return Object.fromEntries(CONSENT_SIGNALS.map((k) => [k, state]));
}

/**
 * Pre-paint consent script. Runs in <head> BEFORE gtag.js.
 *
 * Order is the entire point. Consent Mode only works if the default command is
 * in the dataLayer before the Google tag initialises; set it afterwards and the
 * tag has already written its cookies, which is the violation the banner
 * exists to prevent. Next's `beforeInteractive` strategy guarantees this
 * placement, and the docs confirm such scripts are always injected into <head>
 * regardless of where the component sits.
 *
 * It also stamps the resolved state on <html> so the banner can decide whether
 * to render without waiting for hydration, and parks it on window for the Meta
 * Pixel snippet, which runs later and needs the same answer.
 *
 * Deliberately dependency-free and wrapped in try/catch: localStorage throws
 * outright in some private-browsing modes, and a throw here would take the
 * Google tag down with it.
 */
export const CONSENT_PREPAINT_SCRIPT = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
var s='${CONSENT_DEFAULT}';
try{var v=localStorage.getItem('${CONSENT_STORAGE_KEY}');
if(v==='granted'||v==='denied'){s=v}
else if(navigator.globalPrivacyControl===true){s='denied'}}catch(e){}
window.__raaydrConsent=s;
gtag('consent','default',{${CONSENT_SIGNALS.map((k) => `${k}:s`).join(",")},wait_for_update:500});
try{document.documentElement.setAttribute('data-consent',s)}catch(e){}
`.trim();

/**
 * Meta Pixel snippet, held closed until consent.
 *
 * `fbq('consent','revoke')` must come before `init`, otherwise the pixel sets
 * its _fbp cookie on load and the revoke arrives too late to matter. When the
 * stored answer is already "granted" the PageView fires here as normal; when it
 * is not, ConsentBanner fires it on accept instead, so the view is not lost.
 */
export const META_PIXEL_SCRIPT = (pixelId: string) => `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
var granted=window.__raaydrConsent==='granted';
fbq('consent',granted?'grant':'revoke');
fbq('init','${pixelId}');
if(granted){fbq('track','PageView')}
`.trim();

/** Read the stored choice. `null` when undecided or unreadable. */
export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Global Privacy Control: a browser-level "do not sell or share" signal.
 *
 * California's CPRA requires businesses to honour it, and RAAYDR serves US
 * traffic, so it is treated as an answer rather than a hint. A visitor sending
 * GPC has already opted out at the browser level; showing them a banner asking
 * the same question is the thing the signal exists to prevent.
 *
 * An explicit stored choice still wins. Someone who pressed Accept on our own
 * banner made a later, more specific decision than a standing browser default,
 * and overriding that would be its own kind of ignoring the user.
 */
export function gpcEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.globalPrivacyControl === true;
}

/**
 * The state to act on right now.
 *
 * Stored choice first, then GPC, then the default. GPC and the default happen
 * to agree today — both deny — but they are kept separate because they are
 * different things: one is a request from the visitor, the other is our
 * fallback. If CONSENT_DEFAULT ever moved, GPC must still deny.
 */
export function effectiveConsent(): ConsentState {
  const stored = readConsent();
  if (stored) return stored;
  return gpcEnabled() ? "denied" : CONSENT_DEFAULT;
}

/** Whether to ask at all. Not asking someone who already signalled GPC is the
 *  point of honouring it. */
export function shouldAskConsent(): boolean {
  return readConsent() === null && !gpcEnabled();
}

/**
 * Record a choice and push it to both tags.
 *
 * A denial is stored, not just left absent. Storing it is what stops the banner
 * reappearing on every page, and "denied" written explicitly is also the record
 * that the visitor was asked and said no.
 */
export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    // Storage unavailable. The tags below are still updated for this page view;
    // the visitor will simply be asked again next time, which is the safe way
    // for this to fail.
  }
  try {
    document.documentElement.setAttribute("data-consent", state);
  } catch {
    /* no document */
  }

  window.__raaydrConsent = state;

  const w = window as Window & {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };

  w.gtag?.("consent", "update", consentPayload(state));

  if (state === "granted") {
    w.fbq?.("consent", "grant");
    // The load-time PageView was suppressed while consent was pending, so it is
    // fired here instead. Without this, an accepting visitor's first page never
    // reaches Meta at all.
    w.fbq?.("track", "PageView");
  } else {
    w.fbq?.("consent", "revoke");
  }

  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGE_EVENT, { detail: state })
  );
}

declare global {
  interface Window {
    __raaydrConsent?: ConsentState;
  }
  interface Navigator {
    /** Global Privacy Control. Not in lib.dom yet; set by Brave, DuckDuckGo,
     *  Firefox's "tell websites not to sell my data" and several extensions. */
    globalPrivacyControl?: boolean;
  }
}

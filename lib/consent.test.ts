import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_DEFAULT,
  CONSENT_PREPAINT_SCRIPT,
  CONSENT_SIGNALS,
  CONSENT_STORAGE_KEY,
  META_PIXEL_SCRIPT,
  consentPayload,
  effectiveConsent,
  readConsent,
  setConsent,
} from "./consent";

// A minimal window/localStorage/document stand-in. The consent module is
// deliberately dependency-free so it can run in the pre-paint script, which
// means it is also testable without a DOM library.
function stubBrowser() {
  const store = new Map<string, string>();
  const attrs = new Map<string, string>();
  const gtag = vi.fn();
  const fbq = vi.fn();
  const events: string[] = [];

  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  });
  vi.stubGlobal("document", {
    documentElement: {
      setAttribute: (k: string, v: string) => void attrs.set(k, v),
    },
  });
  vi.stubGlobal("window", {
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
    gtag,
    fbq,
    dispatchEvent: (e: Event) => void events.push(e.type),
  });

  return { store, attrs, gtag, fbq, events };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("the default", () => {
  // This is the legal basis of the entire banner. A default of "granted" would
  // track every visitor who never touched it, which is what consent exists to
  // prevent. If this test is failing, the fix is the code, not the test.
  it("is denied", () => {
    expect(CONSENT_DEFAULT).toBe("denied");
  });

  it("applies when nothing is stored", () => {
    stubBrowser();
    expect(readConsent()).toBeNull();
    expect(effectiveConsent()).toBe("denied");
  });
});

describe("consentPayload", () => {
  it("covers all four Consent Mode v2 signals", () => {
    expect(CONSENT_SIGNALS).toEqual([
      "ad_storage",
      "analytics_storage",
      "ad_user_data",
      "ad_personalization",
    ]);
    expect(consentPayload("denied")).toEqual({
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });
});

describe("the pre-paint script", () => {
  // Consent Mode only binds if the default reaches the dataLayer before
  // gtag.js initialises, so the script has to be self-sufficient: it cannot
  // import anything or wait for hydration.
  it("sets the default before anything else can run", () => {
    expect(CONSENT_PREPAINT_SCRIPT).toContain("gtag('consent','default'");
    expect(CONSENT_PREPAINT_SCRIPT).toContain(`var s='denied'`);
  });

  it("reads a stored choice so a returning visitor is not re-asked", () => {
    expect(CONSENT_PREPAINT_SCRIPT).toContain(CONSENT_STORAGE_KEY);
    expect(CONSENT_PREPAINT_SCRIPT).toContain("wait_for_update");
  });

  // localStorage throws outright in some private-browsing modes. An
  // unprotected throw here would take the Google tag down with it.
  it("guards every storage and DOM access", () => {
    expect(CONSENT_PREPAINT_SCRIPT.match(/try\{/g)?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("the Meta Pixel snippet", () => {
  // fbq('consent','revoke') AFTER init is useless: the pixel has already set
  // _fbp by then. The ordering is the whole control.
  it("revokes before init", () => {
    const s = META_PIXEL_SCRIPT("123");
    expect(s.indexOf("fbq('consent'")).toBeLessThan(s.indexOf("fbq('init'"));
  });

  it("only fires PageView when consent is already granted", () => {
    const s = META_PIXEL_SCRIPT("123");
    expect(s).toContain("if(granted){fbq('track','PageView')}");
  });
});

describe("setConsent", () => {
  it("stores the choice and updates both tags on accept", () => {
    const { store, gtag, fbq, attrs } = stubBrowser();
    setConsent("granted");

    expect(store.get(CONSENT_STORAGE_KEY)).toBe("granted");
    expect(attrs.get("data-consent")).toBe("granted");
    expect(gtag).toHaveBeenCalledWith("consent", "update", consentPayload("granted"));
    expect(fbq).toHaveBeenCalledWith("consent", "grant");
    // The load-time PageView was suppressed, so accepting has to replay it or
    // the accepting visitor's first page never reaches Meta at all.
    expect(fbq).toHaveBeenCalledWith("track", "PageView");
  });

  it("stores a rejection rather than leaving it absent", () => {
    const { store, gtag, fbq } = stubBrowser();
    setConsent("denied");

    // Stored explicitly: this is what stops the banner reappearing on every
    // page, and it records that the visitor was asked and said no.
    expect(store.get(CONSENT_STORAGE_KEY)).toBe("denied");
    expect(gtag).toHaveBeenCalledWith("consent", "update", consentPayload("denied"));
    expect(fbq).toHaveBeenCalledWith("consent", "revoke");
    expect(fbq).not.toHaveBeenCalledWith("track", "PageView");
  });

  it("round-trips through storage", () => {
    stubBrowser();
    setConsent("granted");
    expect(readConsent()).toBe("granted");
    expect(effectiveConsent()).toBe("granted");
  });
});

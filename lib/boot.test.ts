import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BOOT_PREPAINT_SCRIPT,
  FADE_MS,
  MAX_MS,
  MIN_MS,
  MOTION_ATTR,
  OPENING_HOLD_MS,
  OPENING_MAX_MS,
  OPENING_OUT_MS,
  OPENING_REDUCED_HOLD_MS,
  OPENING_REDUCED_OUT_MS,
  OPENING_STORAGE_KEY,
} from "./boot";

// The curtain script runs in <head> before anything else exists, so it is
// written against bare globals and nothing else. That makes it testable the
// same way the consent pre-paint script is: stub the handful of globals it
// touches and run the source.
//
// These are the guarantees worth a test. The curtain has to be escapable no
// matter what the network does, it has to stand down for the signup cover, and
// it must not touch the DOM node React owns. Each of those has already been a
// bug once.

type Harness = {
  attrs: Map<string, string>;
  fire: (event: string) => void;
  removals: number;
  transitions: () => number;
  skipped: () => number;
  fontsReady: Promise<void>;
  storage: Map<string, string>;
};

let harness: Harness;

function boot({
  reducedMotion = false,
  joined = false,
  readyState = "loading",
  hasIdleCallback = true,
  search = "",
  storage = new Map<string, string>([[OPENING_STORAGE_KEY, "1"]]),
  storageThrows = false,
}: {
  reducedMotion?: boolean;
  joined?: boolean;
  readyState?: string;
  hasIdleCallback?: boolean;
  search?: string;
  storage?: Map<string, string>;
  storageThrows?: boolean;
} = {}) {
  const attrs = new Map<string, string>();
  if (joined) attrs.set("data-joined", "1");
  const listeners = new Map<string, Array<() => void>>();
  const state = { removals: 0, transitions: 0, skipped: 0 };

  const bootNode = {
    parentNode: {
      removeChild: () => {
        state.removals += 1;
      },
    },
  };

  vi.stubGlobal("document", {
    get readyState() {
      return readyState;
    },
    documentElement: {
      setAttribute: (k: string, v: string) => void attrs.set(k, v),
      getAttribute: (k: string) => attrs.get(k) ?? null,
      removeAttribute: (k: string) => void attrs.delete(k),
    },
    fonts: { ready: Promise.resolve() },
    getElementById: () => bootNode,
    startViewTransition: () => {
      state.transitions += 1;
      return {
        ready: Promise.resolve(),
        skipTransition: () => {
          state.skipped += 1;
        },
      };
    },
  });
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("reduce") ? reducedMotion : !reducedMotion,
  }));
  vi.stubGlobal("addEventListener", (type: string, fn: () => void) => {
    listeners.set(type, [...(listeners.get(type) ?? []), fn]);
  });
  // The default is a session that has ALREADY seen the opening, so every test
  // written before the opening existed still exercises the short curtain it was
  // written for. The opening tests below pass an empty `storage` on purpose.
  vi.stubGlobal("location", { search });
  vi.stubGlobal("window", {
    get sessionStorage() {
      if (storageThrows) throw new Error("storage is blocked");
      return {
        getItem: (k: string) => storage.get(k) ?? null,
        setItem: (k: string, v: string) => void storage.set(k, v),
      };
    },
  });
  if (hasIdleCallback) {
    vi.stubGlobal("requestIdleCallback", (fn: () => void) => setTimeout(fn, 50));
  }

  new Function(BOOT_PREPAINT_SCRIPT)();

  harness = {
    attrs,
    fire: (event) => (listeners.get(event) ?? []).forEach((fn) => fn()),
    get removals() {
      return state.removals;
    },
    fontsReady: Promise.resolve(),
    storage,
    transitions: () => state.transitions,
    skipped: () => state.skipped,
  } as Harness;
  return harness;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("the motion stamp", () => {
  it("is on when script runs and motion is welcome", () => {
    expect(boot().attrs.get(MOTION_ATTR)).toBe("on");
  });

  // Without JavaScript nothing sets it, which is the other half of the
  // question CSS cannot ask. Reduced motion is the half it can.
  it("is absent under reduced motion", () => {
    expect(boot({ reducedMotion: true }).attrs.has(MOTION_ATTR)).toBe(false);
  });

  // The stamp says what the document will do; the curtain standing down for
  // the signup cover has nothing to do with that.
  it("is still set when the curtain stands down", () => {
    const h = boot({ joined: true });
    expect(h.attrs.get(MOTION_ATTR)).toBe("on");
    expect(h.attrs.has("data-booting")).toBe(false);
  });
});

describe("the curtain", () => {
  it("is up before anything else has happened", () => {
    expect(boot().attrs.get("data-booting")).toBe("1");
  });

  it("lifts once the page has loaded, fonts are in, and the thread is free", async () => {
    const h = boot();
    h.fire("load");
    await vi.advanceTimersByTimeAsync(MIN_MS + 100);
    expect(h.attrs.get("data-booting")).toBe("0");
    await vi.advanceTimersByTimeAsync(FADE_MS + 50);
    expect(h.attrs.has("data-booting")).toBe(false);
  });

  it("does not flash: it stays up for the minimum even on a warm load", async () => {
    const h = boot();
    h.fire("load");
    await vi.advanceTimersByTimeAsync(MIN_MS - 200);
    expect(h.attrs.get("data-booting")).toBe("1");
  });

  // The one that matters. A stalled subresource, a `load` that never fires, a
  // font that 404s — none of them may strand a reader behind an opaque panel.
  it("lifts on its own even if load never fires", async () => {
    const h = boot();
    await vi.advanceTimersByTimeAsync(MAX_MS + FADE_MS + 100);
    expect(h.attrs.has("data-booting")).toBe(false);
  });

  it("still lifts where there is no requestIdleCallback", async () => {
    const h = boot({ hasIdleCallback: false });
    h.fire("load");
    await vi.advanceTimersByTimeAsync(MIN_MS + 400 + FADE_MS);
    expect(h.attrs.has("data-booting")).toBe(false);
  });

  // The curtain is server-rendered markup React owns, and this script finishes
  // long before hydration does on a slow connection. Removing the node from
  // under React produced a hydration mismatch, React put it back, and a
  // mismatch that re-renders the tree is the same failure that throws readers
  // to the top of the page. Attribute only, forever.
  it("never removes the node it covers with", async () => {
    const h = boot();
    h.fire("load");
    await vi.advanceTimersByTimeAsync(MAX_MS + FADE_MS + 100);
    expect(h.removals).toBe(0);
  });
});

// THE OPENING. The same curtain, played longer on the first load of a session
// (Ric, platform board rows 2396 and 2401). Every guarantee above must still
// hold for it: it can always be escaped, it stands down for the signup cover,
// and it never removes the node React owns.
describe("the opening", () => {
  const first = () => boot({ storage: new Map() });

  it("plays on the first load of a session and says so", () => {
    expect(first().attrs.get("data-opening")).toBe("1");
  });

  it("does not play on a later load in the same session", () => {
    const storage = new Map<string, string>();
    boot({ storage });
    const second = boot({ storage });
    expect(second.attrs.has("data-opening")).toBe(false);
    expect(second.attrs.get("data-booting")).toBe("1");
  });

  // A refresh at one second must not play it again, so the flag is written when
  // the opening STARTS, not when it ends.
  it("sets the flag at the start, not at the end", () => {
    const h = first();
    expect(h.storage.get(OPENING_STORAGE_KEY)).toBe("1");
  });

  it("replays with ?opening=1 even when it has already played", () => {
    const h = boot({ search: "?opening=1" });
    expect(h.attrs.get("data-opening")).toBe("1");
  });

  it("does not take ?opening=11 or another parameter's value for the replay", () => {
    expect(boot({ search: "?opening=11" }).attrs.has("data-opening")).toBe(false);
    expect(boot({ search: "?xopening=1" }).attrs.has("data-opening")).toBe(false);
  });

  // Blocked storage is a private window or a locked-down browser. It must mean
  // the short curtain, never the long one on every page of the visit.
  it("does not play where storage is blocked, and the short curtain still runs", () => {
    const h = boot({ storageThrows: true });
    expect(h.attrs.has("data-opening")).toBe(false);
    expect(h.attrs.get("data-booting")).toBe("1");
  });

  it("stands down for the signup cover and does not spend the session's one play", () => {
    const storage = new Map<string, string>();
    const h = boot({ joined: true, storage });
    expect(h.attrs.has("data-opening")).toBe(false);
    expect(storage.has(OPENING_STORAGE_KEY)).toBe(false);
  });

  it("holds the lockup for the full hold even on a warm load", async () => {
    const h = first();
    h.fire("load");
    await vi.advanceTimersByTimeAsync(OPENING_HOLD_MS - 200);
    expect(h.attrs.get("data-booting")).toBe("1");
    await vi.advanceTimersByTimeAsync(200 + 100);
    expect(h.attrs.get("data-booting")).toBe("0");
  });

  it("holds 3.5 seconds and pushes out for 0.9, about 4.4 seconds in all", () => {
    expect(OPENING_HOLD_MS).toBe(3500);
    expect(OPENING_OUT_MS).toBe(900);
  });

  // Riz measured the first cut on screen for 9 to 10 seconds (board row 2417)
  // because it waited for the page after its hold. It must not: the hold ends
  // it, whatever load, fonts and idle are doing.
  it("ends at the hold even when the page is not ready, and never waits for it", async () => {
    const h = first();
    await vi.advanceTimersByTimeAsync(OPENING_MAX_MS + 50);
    expect(h.attrs.get("data-booting")).toBe("0"); // load has not fired
    await vi.advanceTimersByTimeAsync(OPENING_OUT_MS + 50);
    expect(h.attrs.has("data-booting")).toBe(false);
    expect(h.attrs.has("data-opening")).toBe(false);
  });

  it("is over by about 4.5 seconds in all, from first paint", () => {
    expect(OPENING_MAX_MS + OPENING_OUT_MS).toBeLessThanOrEqual(4500);
  });

  it("takes both attributes back off after the push out, and never the node", async () => {
    const h = first();
    h.fire("load");
    await vi.advanceTimersByTimeAsync(OPENING_HOLD_MS + 300);
    expect(h.attrs.get("data-booting")).toBe("0");
    expect(h.attrs.get("data-opening")).toBe("1"); // still needed while it pushes out
    await vi.advanceTimersByTimeAsync(OPENING_OUT_MS + 50);
    expect(h.attrs.has("data-booting")).toBe(false);
    expect(h.attrs.has("data-opening")).toBe(false);
    expect(h.removals).toBe(0);
  });

  // The guarantee. The long curtain gets its own, longer, escape, because the
  // short one would cut the lockup off before it had held.
  it("lifts on its own even if load never fires", async () => {
    const h = first();
    await vi.advanceTimersByTimeAsync(OPENING_MAX_MS + OPENING_OUT_MS + 100);
    expect(h.attrs.has("data-booting")).toBe(false);
    expect(h.attrs.has("data-opening")).toBe(false);
  });

  it("has a cap that is later than the hold, or the hold could never finish", () => {
    expect(OPENING_MAX_MS).toBeGreaterThan(OPENING_HOLD_MS);
  });

  it("is a different, shorter animation under reduced motion", async () => {
    const h = boot({ storage: new Map(), reducedMotion: true });
    expect(h.attrs.get("data-opening")).toBe("reduced");
    expect(OPENING_REDUCED_HOLD_MS).toBeLessThan(OPENING_HOLD_MS);
    h.fire("load");
    await vi.advanceTimersByTimeAsync(OPENING_REDUCED_HOLD_MS + 300);
    expect(h.attrs.get("data-booting")).toBe("0");
    await vi.advanceTimersByTimeAsync(OPENING_REDUCED_OUT_MS + 50);
    expect(h.attrs.has("data-opening")).toBe(false);
  });

  it("leaves the short curtain exactly as it was for a later load", async () => {
    const h = boot();
    h.fire("load");
    await vi.advanceTimersByTimeAsync(MIN_MS + 100);
    expect(h.attrs.get("data-booting")).toBe("0");
    await vi.advanceTimersByTimeAsync(FADE_MS + 50);
    expect(h.attrs.has("data-booting")).toBe(false);
  });
});

// A root view transition snapshots the whole viewport, the curtain included, so
// one starting while the lockup is up fades the lockup out and a copy back in
// from below: the flash Ric saw on his own device (board row 2418).
describe("view transitions while the curtain is up", () => {
  // Skipping before `ready` rejects it, and React chains onto `ready` without a
  // catch: an uncaught AbortError in the console on every first load.
  it("skips a transition that starts while the curtain is up, once it is ready", async () => {
    const h = boot({ storage: new Map() });
    (document as unknown as { startViewTransition: () => unknown }).startViewTransition();
    expect(h.transitions()).toBe(1); // it still ran, so the update callback still runs
    expect(h.skipped()).toBe(0); // not yet: skipping before ready would reject it
    await Promise.resolve();
    await Promise.resolve();
    expect(h.skipped()).toBe(1);
  });

  it("skips it for the short curtain too, and during the push out", async () => {
    const h = boot();
    h.fire("load");
    await vi.advanceTimersByTimeAsync(MIN_MS + 100);
    expect(h.attrs.get("data-booting")).toBe("0");
    (document as unknown as { startViewTransition: () => unknown }).startViewTransition();
    await Promise.resolve();
    await Promise.resolve();
    expect(h.skipped()).toBe(1);
  });

  it("leaves a transition alone once the curtain is gone", async () => {
    const h = boot();
    h.fire("load");
    await vi.advanceTimersByTimeAsync(MIN_MS + 100 + FADE_MS + 50);
    expect(h.attrs.has("data-booting")).toBe(false);
    (document as unknown as { startViewTransition: () => unknown }).startViewTransition();
    expect(h.skipped()).toBe(0);
  });

  it("does nothing where the browser has no view transitions", () => {
    expect(() => boot({ storage: new Map() })).not.toThrow();
  });
});

// THE HAND-OFF, read from the stylesheet. These pin the two decisions Riz's check
// and Ric's own phone forced (board rows 2417, 2418), so a tidy-up cannot undo
// them without a test saying why.
describe("the Opening's hand-off, in the stylesheet", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const rule = (selector: string) => {
    const at = css.indexOf(selector + " {");
    expect(at, `${selector} has a rule`).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf("}", at));
  };

  // The page must not show through the lockup. If the veil faded as a whole
  // (opacity), the lockup would go with it while the hero came up underneath.
  it("lifts the veil by fading its background, not its opacity, so the lockup goes first", () => {
    expect(rule('html[data-opening][data-booting="0"] .boot')).toMatch(/opacity:\s*1/);
    expect(rule('html[data-opening][data-booting="0"] .boot')).toMatch(/background-color:\s*transparent/);
    expect(rule("html[data-opening][data-booting] .boot")).toMatch(/transition:\s*background-color/);
  });

  it("starts lifting the veil only after the lockup's push out has all but finished", () => {
    const delay = rule("html[data-opening][data-booting] .boot").match(/background-color\s+(\d+)ms\s+linear\s+(\d+)ms/);
    expect(delay).not.toBeNull();
    const [, , after] = delay!;
    expect(Number(after)).toBeGreaterThanOrEqual(400);
  });

  // The backstop is the one thing standing between a stalled main thread and a
  // lockup on screen for ten seconds. It must outlive neither the push out nor
  // be able to fight its opacity.
  it("has a CSS-only backstop that animates visibility and nothing else", () => {
    expect(rule("html[data-opening] .boot")).toMatch(/animation:\s*boot-cap/);
    const frames = css.slice(css.indexOf("@keyframes boot-cap"));
    const body = frames.slice(0, frames.indexOf("\n}\n"));
    expect(body).toMatch(/visibility:\s*hidden/);
    expect(body).not.toMatch(/opacity/);
  });

  it("times the backstop at the end of the push out", () => {
    const m = rule("html[data-opening] .boot").match(/boot-cap\s+1ms\s+linear\s+(\d+)ms/);
    expect(m).not.toBeNull();
    expect(Number(m![1])).toBe(OPENING_HOLD_MS + OPENING_OUT_MS);
  });
});

// Ric, 8 October: the Opening was good and "just too big". It was 782px wide on a 1440 screen
// (190 bars, 26 gap, 566 wordmark). This pins the lockup to a size that leaves clear space, so a
// later tweak to the curtain cannot quietly grow it back.
describe("the Opening's size", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("is under a third of a 1440 screen wide on a desktop, bars and wordmark together", () => {
    const block = css.match(/@media \(min-width: 900px\) \{\s*html\[data-opening\] \.bootInner \{[\s\S]*?html\[data-opening\] \.bootMark \{[^}]*\}/);
    expect(block).not.toBeNull();
    const n = (re: RegExp) => Number(block![0].match(re)![1]);
    const gap = n(/gap:\s*(\d+)px/);
    const bars = n(/\.bootBars \{\s*width:\s*(\d+)px/);
    const word = n(/\.bootMark \{\s*width:\s*(\d+)px/);
    expect(bars + gap + word).toBeLessThanOrEqual(1440 / 3);
  });

  it("keeps the phone lockup under 55% of a 390 screen, and its bars small beside it", () => {
    const m = css.match(/html\[data-opening\] \.bootMark \{\s*width:\s*min\((\d+)vw,\s*(\d+)px\)/);
    expect(m).not.toBeNull();
    expect(Number(m![1])).toBeLessThanOrEqual(55);
    expect(Number(m![2])).toBeLessThanOrEqual(210);
    const bars = css.match(/html\[data-opening\] \.bootBars \{\s*display:\s*block;\s*width:\s*(\d+)px/);
    expect(bars).not.toBeNull();
    expect(Number(bars![1])).toBeLessThanOrEqual(72);
  });
});

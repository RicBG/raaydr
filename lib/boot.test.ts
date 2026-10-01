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
  const state = { removals: 0 };

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

  it("ends as soon as the page is ready after the hold, not later", async () => {
    const h = first();
    await vi.advanceTimersByTimeAsync(OPENING_HOLD_MS + 500);
    expect(h.attrs.get("data-booting")).toBe("1"); // load has not fired: still waiting
    h.fire("load");
    await vi.advanceTimersByTimeAsync(300);
    expect(h.attrs.get("data-booting")).toBe("0");
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

  it("has an escape that is later than the hold, or the hold could never finish", () => {
    expect(OPENING_MAX_MS).toBeGreaterThan(OPENING_HOLD_MS);
    expect(OPENING_MAX_MS).toBeGreaterThan(MAX_MS);
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

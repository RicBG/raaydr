import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BOOT_PREPAINT_SCRIPT, FADE_MS, MAX_MS, MIN_MS, MOTION_ATTR } from "./boot";

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
};

let harness: Harness;

function boot({
  reducedMotion = false,
  joined = false,
  readyState = "loading",
  hasIdleCallback = true,
}: {
  reducedMotion?: boolean;
  joined?: boolean;
  readyState?: string;
  hasIdleCallback?: boolean;
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

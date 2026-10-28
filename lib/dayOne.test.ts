import { describe, expect, it, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { dayOnePlacesRemain } from "./platformSupabase";
import { getAllPosts, getAllSlugs, getPost } from "./pulse";
import { faqData, type FaqPageKey } from "./faqData";
import { PRICING } from "./raaydrRates";

// What the site says about the Day One offer, and what it does when it cannot
// find out. Board rows 2962 and 2965, Ric's go on 2967: "get the site in line
// with whatever wording needs to be correct." work_items 225.

const CONTENT_DIR = path.join(process.cwd(), "content", "pulse");

function source(slug: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf8");
}

describe("the live Day One read fails closed", () => {
  const ENV = { ...process.env };

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...ENV };
  });

  function configure() {
    process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_URL = "https://platform.invalid";
    process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_ANON_KEY = "anon-key-for-the-test";
  }

  function answers(body: unknown, ok = true) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok, json: async () => body })),
    );
  }

  // THE ONE CASE THAT OPENS IT. Everything below this is a way of not opening
  // it, and that asymmetry is the whole design: showing the offer when places
  // have gone sells somebody a place that does not exist, while showing the
  // closed wording when places remain costs one listener who reads the
  // standard price. The two mistakes are not the same size.
  it("is open only when the platform answers with exactly true", async () => {
    configure();
    answers(true);
    await expect(dayOnePlacesRemain()).resolves.toBe(true);
  });

  it("is closed when the platform says places have gone", async () => {
    configure();
    answers(false);
    await expect(dayOnePlacesRemain()).resolves.toBe(false);
  });

  it("is closed on a null, which is what a reader that cannot count returns", async () => {
    configure();
    answers(null);
    await expect(dayOnePlacesRemain()).resolves.toBe(false);
  });

  // A truthy value that is not the boolean. PostgREST returning the string
  // "true", or a one-element array, must not be read as a yes: it means the
  // shape changed, and a changed shape is not an answer.
  it.each([["true"], [1], [[true]], [{ ok: true }], [undefined]])(
    "is closed on a truthy non-boolean body (%j)",
    async (body) => {
      configure();
      answers(body);
      await expect(dayOnePlacesRemain()).resolves.toBe(false);
    },
  );

  it("is closed on a non-2xx, however it is worded", async () => {
    configure();
    answers(true, false);
    await expect(dayOnePlacesRemain()).resolves.toBe(false);
  });

  it("is closed when the request throws, which covers a timeout and DNS", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      }),
    );
    await expect(dayOnePlacesRemain()).resolves.toBe(false);
  });

  it("is closed on a body that will not parse", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => {
          throw new Error("not json");
        },
      })),
    );
    await expect(dayOnePlacesRemain()).resolves.toBe(false);
  });

  // A preview build with no platform variables set. It must not ask, and it
  // must not guess: the closed wording is the honest thing for a deployment
  // that has no way to find out.
  it("is closed, and asks nothing, when the deployment has no platform config", async () => {
    delete process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_ANON_KEY;
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    await expect(dayOnePlacesRemain()).resolves.toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it("asks for the boolean reader, never the one that returns a count", async () => {
    configure();
    const spy = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      json: async () => true,
    }));
    vi.stubGlobal("fetch", spy);
    await dayOnePlacesRemain();
    const url = spy.mock.calls[0][0];
    expect(url).toContain("/rest/v1/rpc/day_one_listener_places_remain");
    // `day_one_places_left()` returns the NUMBER and is deliberately not
    // granted to anon on the platform: a published count is a figure that can
    // be quoted back at us. Asking for it from here would be a 404 at best and
    // a published count at worst.
    expect(url).not.toContain("day_one_places_left");
  });
});

describe("no post states a Day One price or cohort size in its own words", () => {
  // THE FAULT THIS REPLACES. Three posts carried a line reading "Update,
  // 24 September 2026: Day One is now the first 100 listeners at £6.99 a
  // month" directly above body text that already said the same thing, because
  // the body had been corrected in PR #77 and the note had not been removed.
  // An article should say the true thing once, not argue with itself.
  it.each(getAllSlugs())("%s carries no Update note restating a price", (slug) => {
    expect(source(slug)).not.toMatch(/Update,[^\n]*£/);
  });

  // Every price in prose must be a token. These three had gone stale once
  // already: the cohort was 1,000 listeners in two bands, 250 at one price and
  // 750 at another, until Ric replaced it on 24 September 2026.
  it.each(getAllSlugs())("%s spells no Day One or standard price by hand", (slug) => {
    const body = source(slug).split("\n").slice(6).join("\n");
    expect(body).not.toContain(`£${PRICING.dayOne}`);
    expect(body).not.toContain(`£${PRICING.standard} a month`);
  });

  // The retired band, by every name it went under.
  it.each(getAllSlugs())("%s does not describe the retired two-band cohort", (slug) => {
    const raw = source(slug);
    expect(raw).not.toContain("£7.99");
    expect(raw).not.toMatch(/\b250 at\b/);
    expect(raw).not.toMatch(/1,000 listeners/);
  });
});

describe("the live line goes where the offer is stated", () => {
  it("flags exactly the posts whose source cites the offer", () => {
    const flagged = getAllPosts()
      .filter((p) => p.citesDayOneOffer)
      .map((p) => p.slug)
      .sort();
    const citing = getAllSlugs()
      .filter((slug) => {
        const raw = source(slug);
        return raw.includes("{{dayOne.price}}") || raw.includes("{{dayOne.cap}}");
      })
      .sort();
    expect(flagged).toEqual(citing);
    // Not vacuous: if the sweep above ever empties, this says so rather than
    // passing on two empty lists.
    expect(flagged.length).toBeGreaterThan(0);
  });

  it("does not flag a post that only cites a per-fan rate", () => {
    // This post quotes the Day One PER-FAN artist rate but never the price or
    // the cohort size, so a Day One status line on it would be noise.
    const post = getPost("best-spotify-alternatives-independent-artists");
    expect(post?.citesDayOneOffer).toBe(false);
  });

  it("flags every FAQ answer that states the offer, and only those", () => {
    const keys = Object.keys(faqData) as FaqPageKey[];
    const flagged = keys.flatMap((key) =>
      faqData[key].filter((item) => item.statesDayOneOffer).map((item) => item.question),
    );
    const stating = keys.flatMap((key) =>
      faqData[key]
        .filter(
          (item) =>
            item.answer.includes(`£${PRICING.dayOne}`),
        )
        .map((item) => item.question),
    );
    expect(flagged.sort()).toEqual(stating.sort());
    expect(flagged.length).toBeGreaterThan(0);
  });

  it("gives every answer that quotes the price a closed wording that does not", () => {
    const keys = Object.keys(faqData) as FaqPageKey[];
    for (const key of keys) {
      for (const item of faqData[key].filter((i) => i.answer.includes(`£${PRICING.dayOne}`))) {
        expect(item.closedAnswer, item.question).toBeTruthy();
        expect(item.closedAnswer, item.question).not.toContain(`£${PRICING.dayOne}`);
      }
    }
  });

  it("publishes the closed wording in the FAQ structured data", () => {
    const accordion = fs.readFileSync(
      path.join(process.cwd(), "components", "FaqAccordion.tsx"),
      "utf8",
    );
    expect(accordion).toContain("text: item.closedAnswer ?? item.answer");
  });

  it("keeps the flag out of the FAQ structured data", () => {
    // FaqAccordion's JSON-LD mapper reads `question` and `answer` by name. If
    // it ever spreads the item instead, `statesDayOneOffer` would be published
    // as part of a schema.org Question.
    const accordion = fs.readFileSync(
      path.join(process.cwd(), "components", "FaqAccordion.tsx"),
      "utf8",
    );
    expect(accordion).toContain("name: item.question");
    expect(accordion).not.toMatch(/mainEntity:\s*items\.map\(\(item\)\s*=>\s*\(\{\s*\.\.\.item/);
  });
});

describe("the retired second band is gone from the site config too", () => {
  it("publishes one Day One band", async () => {
    const { siteConfig } = await import("./siteConfig");
    expect(Object.keys(siteConfig.pricing)).toEqual([
      "dayOne",
      "standard",
      "plus",
      "dayOneCap",
    ]);
  });
});

// ---------------------------------------------------------------------------
// The other surfaces: home, About, the listeners page, the waitlist forms and llms.txt.
// work_items 225 listed every place the offer appears; these hold each to the same rule as the
// Pulse posts -- the page never sells a place unless the platform has said one remains.
// ---------------------------------------------------------------------------

import { DAY_ONE_CLOSED_LINE, DAY_ONE_OPEN_LINE, dayOneOfferLine } from "./dayOneOffer";
import { offerFor } from "./waitlistOffers";
import { dayOneTierLines, readLlmsTemplate, renderLlmsTxt } from "./llmsTxt";

function readSrc(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

describe("the two wordings", () => {
  it("open states the offer and closed never does", () => {
    expect(dayOneOfferLine(true)).toBe(DAY_ONE_OPEN_LINE);
    expect(dayOneOfferLine(false)).toBe(DAY_ONE_CLOSED_LINE);
    expect(DAY_ONE_OPEN_LINE).toContain(`£${PRICING.dayOne}`);
    expect(DAY_ONE_CLOSED_LINE).not.toContain(`£${PRICING.dayOne}`);
    expect(DAY_ONE_CLOSED_LINE).toContain(`£${PRICING.standard}`);
    expect(DAY_ONE_CLOSED_LINE).toMatch(/places have gone/);
  });

  it("the closed wording makes no promise about being early", () => {
    expect(DAY_ONE_CLOSED_LINE).not.toMatch(/early|first|lock|forever/i);
  });
});

describe("the waitlist offer line fails closed", () => {
  it("defaults to closed when a caller does not pass the live answer", () => {
    expect(offerFor(null)).toBe(DAY_ONE_CLOSED_LINE);
    expect(offerFor("Listener")).toBe(DAY_ONE_CLOSED_LINE);
  });

  it("opens only when told places remain", () => {
    expect(offerFor(null, true)).toBe(DAY_ONE_OPEN_LINE);
    expect(offerFor("Listener", true)).toBe(DAY_ONE_OPEN_LINE);
  });

  it("leaves the creator cohorts alone, in both states", () => {
    for (const open of [true, false]) {
      expect(offerFor("Artist", open)).toContain("RAAYDR+ free forever");
      expect(offerFor("Artist", open)).not.toContain(`£${PRICING.dayOne}`);
    }
  });
});

describe("llms.txt fails closed", () => {
  const template = readLlmsTemplate();

  it("ships a template with the tier line as a token, not a typed price", () => {
    expect(template).toContain("{{dayOne.tier}}");
    expect(template).not.toContain(`£${PRICING.dayOne}`);
  });

  it("states the offer only when places remain", () => {
    expect(renderLlmsTxt(template, true)).toContain(`£${PRICING.dayOne} a month`);
    expect(renderLlmsTxt(template, false)).not.toContain(`£${PRICING.dayOne}`);
    expect(renderLlmsTxt(template, false)).toContain(`standard £${PRICING.standard} a month`);
  });

  it("leaves no token behind in either state", () => {
    for (const open of [true, false]) {
      expect(renderLlmsTxt(template, open)).not.toContain("{{");
    }
    expect(dayOneTierLines(false)).toMatch(/places have gone/);
  });

  it("is served per request and never cached", () => {
    const route = readSrc("app/llms.txt/route.ts");
    expect(route).toContain('dynamic = "force-dynamic"');
    expect(route).toContain("no-store");
    expect(route).toContain("dayOnePlacesRemain");
  });
});

describe("no static surface sells a place", () => {
  // These four used to interpolate the offer into a string at build time, which is a sentence
  // that can be wrong for as long as the page is cached. They go through DayOneOffer, the hook or
  // dayOneOfferLine, all of which start closed. If one of them reads PRICING.dayOne or
  // DAY_ONE_TERMS directly again, this fails.
  it.each([
    "components/sections/FirstWave.tsx",
    "app/for-listeners/page.tsx",
  ])("%s does not state the Day One price itself", (file) => {
    const src = readSrc(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(src).not.toMatch(/DAY_ONE_TERMS/);
    expect(src).not.toMatch(/pricing\.dayOne\b|PRICING\.dayOne\b/);
  });

  it("About states the open wording only inside DayOneOffer", () => {
    const src = readSrc("components/AboutContent.tsx");
    const at = src.indexOf("DAY_ONE_TERMS.they");
    expect(at).toBeGreaterThan(-1);
    const before = src.slice(0, at);
    expect(before.lastIndexOf("<DayOneOffer")).toBeGreaterThan(before.lastIndexOf("/>"));
  });

  it("the live components start closed", () => {
    expect(readSrc("components/useDayOnePlacesRemain.ts")).toContain("useState(false)");
    expect(readSrc("components/DayOneOffer.tsx")).toContain('"closed"');
  });
});

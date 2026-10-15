import { describe, expect, it } from "vitest";
import {
  CREATOR_KIND_OPTIONS,
  CREATOR_KIND_SLUGS,
  isCreatorKindSlug,
} from "./creatorKind";

describe("creator kind", () => {
  it("offers producer, songwriter and both, in that order", () => {
    expect(CREATOR_KIND_OPTIONS.map((o) => o.slug)).toEqual([
      "producer",
      "songwriter",
      "both",
    ]);
    expect(CREATOR_KIND_OPTIONS.map((o) => o.slug)).toEqual([
      ...CREATOR_KIND_SLUGS,
    ]);
  });

  it("accepts only the three slugs", () => {
    expect(isCreatorKindSlug("both")).toBe(true);
    expect(isCreatorKindSlug("artist")).toBe(false);
    expect(isCreatorKindSlug("")).toBe(false);
  });
});

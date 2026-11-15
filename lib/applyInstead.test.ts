import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { applicationUrlFor } from "./applyInstead";
import { applyUrl } from "./siteConfig";
import { WAITLIST_ROLE_SLUGS } from "./waitlistRoles";

describe("which roles apply instead of joining a list", () => {
  it("sends a tastemaker to the platform application with the ruled UTMs, from any form", () => {
    expect(applicationUrlFor("tastemaker")).toBe(applyUrl.tastemaker);
    expect(applyUrl.tastemaker).toContain("https://app.raaydr.com/apply/tastemaker?");
    expect(applyUrl.tastemaker).toContain("utm_source=raaydr_site");
    expect(applyUrl.tastemaker).toContain("utm_campaign=tastemakers");
  });

  it("leaves every other role where it is: listeners and producers join the list, artists already apply in the form", () => {
    const others = WAITLIST_ROLE_SLUGS.filter((s) => s !== "tastemaker");
    expect(others.length).toBe(3);
    for (const slug of others) expect(applicationUrlFor(slug)).toBeNull();
  });
});

describe("the shared form", () => {
  const form = readFileSync(join(__dirname, "../components/WaitlistForm.tsx"), "utf8");

  it("hands a tastemaker to the application BEFORE anything is posted, so no waitlist row can be written", () => {
    const handoff = form.indexOf("applicationUrlFor(slug)");
    expect(handoff).toBeGreaterThan(-1);
    expect(handoff).toBeLessThan(form.indexOf("fetch("));
    expect(handoff).toBeLessThan(form.indexOf("submitArtistApplication(", form.indexOf("async function onSubmit")));
  });

  it("offers the application link as soon as Tastemaker is picked, not only on submit", () => {
    expect(form).toContain("applicationUrlFor(ROLE_LABEL_TO_SLUG[role])");
    expect(form).toContain("Apply to join");
  });
});

describe("the waitlist route refuses a tastemaker at the door", () => {
  it("returns 400 for role tastemaker before anything is written", () => {
    const route = readFileSync(join(import.meta.dirname, "../app/api/waitlist/route.ts"), "utf8");
    const refusal = route.indexOf("applicationUrlFor(role)");
    expect(refusal).toBeGreaterThan(route.indexOf("isWaitlistRoleSlug(role)"));
    expect(refusal).toBeLessThan(route.indexOf("p_role: role"));
    expect(route).toContain("status: 400");
  });
});

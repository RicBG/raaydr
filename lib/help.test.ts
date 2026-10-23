import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { readHelp } from "./legal";

/*
 * The help page (board rows 3902, 3920, 3922). It is the support URL App Store Connect wants and the
 * page the app's Help screen points at, so the one thing it must always carry is the address.
 */
describe("the help page", () => {
  const raw = fs.readFileSync(path.join(process.cwd(), "content", "help.md"), "utf8");

  it("carries the support address, which is real", () => {
    expect(raw).toContain("help@raaydr.com");
  });

  it("parses with a title and sections, and links the policies it points at", () => {
    const doc = readHelp();
    expect(doc.title).toBe("Help");
    expect(doc.sections.length).toBeGreaterThan(2);
    for (const href of ["/privacy", "/terms", "/website-terms", "/cookies"]) {
      expect(raw).toContain(`](${href})`);
    }
  });

  it("promises nothing the product does not do yet", () => {
    expect(raw).toContain("Nothing has been paid yet");
    expect(raw).not.toMatch(/instant|guarantee|within 24 hours|delete your account (here|from settings)/i);
  });

  it("uses no dashes as punctuation", () => {
    expect(raw).not.toMatch(/[–—]/);
  });

  it("is in the sitemap and the footer", () => {
    expect(fs.readFileSync(path.join(process.cwd(), "app", "sitemap.ts"), "utf8")).toContain('"/help"');
    expect(fs.readFileSync(path.join(process.cwd(), "components", "Footer.tsx"), "utf8")).toContain('"/help"');
  });
});

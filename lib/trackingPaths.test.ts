import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isHomePath, TRACKING_PATHS, trackingPathMetadata } from "./trackingPaths";

const APP = join(__dirname, "..", "app");
const paths = Object.keys(TRACKING_PATHS);

describe("tracking paths", () => {
  it("are the five the brief asked for", () => {
    expect(paths.sort()).toEqual(["/dm", "/fb", "/ig", "/th", "/tt"]);
  });

  it.each(paths)("%s has a route that renders the homepage", (p) => {
    const file = join(APP, p.slice(1), "page.tsx");
    expect(existsSync(file)).toBe(true);
    const src = readFileSync(file, "utf8");
    expect(src).toContain('export { default } from "../page"');
    expect(src).toContain("export const metadata = trackingPathMetadata");
  });

  it("every two letter route folder is a listed tracking path", () => {
    const folders = readdirSync(APP, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^[a-z]{2}$/.test(d.name))
      .map((d) => `/${d.name}`);
    expect(folders.sort()).toEqual(paths.sort());
  });

  it("points search at the homepage and stays out of the index", () => {
    expect(trackingPathMetadata.alternates?.canonical).toBe("/");
    expect(trackingPathMetadata.robots).toEqual({ index: false, follow: true });
  });

  it("treats a short path as the homepage and nothing else", () => {
    expect(isHomePath("/")).toBe(true);
    for (const p of paths) expect(isHomePath(p)).toBe(true);
    expect(isHomePath("/artists")).toBe(false);
    expect(isHomePath("/tt/x")).toBe(false);
    expect(isHomePath("constructor")).toBe(false);
    expect(isHomePath(null)).toBe(false);
  });
});

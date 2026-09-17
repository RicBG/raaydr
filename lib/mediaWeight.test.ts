import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Nothing in `public/media` may be heavy enough to kill a phone.
 *
 * ============================================================================
 * WHY THIS EXISTS
 * ============================================================================
 *
 * On 17 September 2026 a friend of Ric's opened `raaydr.com/artists` from a link he
 * had sent her personally and got iOS Safari's *"This page couldn't load."* That
 * message is the WebKit content process being killed, which is nearly always memory.
 * It happened the night before paid ads were pointed at that exact page.
 *
 * The page was 79KB of HTML and served in 0.19s. It then pulled a **7,017,289 byte**
 * hero video: a five second 720p clip encoded at **11 megabits per second**, roughly
 * ten to twenty times what it needed, with an AAC audio track on a video that is muted
 * and `aria-hidden`. The video was 89% of the page. All four audience pages had the
 * same fault, 23MB between them.
 *
 * Re-encoded at CRF 23 with the audio stripped, the same four came to 3.4MB, at
 * SSIM 0.98 and PSNR 45dB against the originals, which is the range where a difference
 * is not visible. Board rows 1078 and 1082.
 *
 * ============================================================================
 * WHY A TEST RATHER THAN A NOTE
 * ============================================================================
 *
 * Nobody chose 11 Mbit/s. It is what an export dialog produced, and once the file was
 * in `public/` nothing in the project had an opinion about it: no check read its size,
 * and the markup around it was already correct (`preload="metadata"`, muted, inline,
 * with a poster). **The attributes were right and the file was wrong**, so every review
 * that read the code found nothing.
 *
 * That is the same class as the rendition-width mismatch on the platform side: a fact
 * the code depends on that nothing was asserting. A number in a comment would not have
 * caught it, because the file arrives from outside the editor.
 */

const MEDIA_DIR = join(process.cwd(), "public", "media");

/**
 * The ceiling, in bytes. 1.5MB is about twice what a well encoded five second hero
 * clip needs, so it passes a sensible export and fails the kind that took the site
 * down. It is a budget rather than a target: nothing here should be close to it.
 */
const MAX_BYTES = 1_500_000;

/**
 * Files allowed over the ceiling, each with the reason.
 *
 * EVERY ENTRY HERE IS CURRENTLY UNREFERENCED, which is why none of them caused the
 * crash: no component, stylesheet or route names any of them, so a visitor never
 * requests one. They are roughly 19MB sitting in `public/` that appears to ship
 * nowhere.
 *
 * They are declared rather than deleted because deleting assets is not the same kind
 * of change as fixing a crash, and it was raised for Ric to confirm rather than done
 * inside a hotfix. If he confirms they are dead, the right change is to remove both
 * the files and these entries.
 *
 * An entry whose file has gone, or which no longer needs the exemption, fails below,
 * so this list cannot quietly outlive its reasons.
 */
const OVERSIZED_ON_PURPOSE = new Map<string, string>([
  [
    "ring.mp4",
    "Unreferenced. The Ring component is CSS transforms and a blurred disc, not video, " +
      "so nothing loads this. Kept pending Ric confirming it is dead.",
  ],
  [
    "raaydr_halo.mp4",
    "Unreferenced. An earlier halo cut, superseded by the per-audience halo films.",
  ],
  [
    "raaydr_halo2.mp4",
    "Unreferenced. A second earlier halo cut, same reason.",
  ],
  [
    "raaydr_halo_transparent.webm",
    "Unreferenced. A transparent variant nothing names.",
  ],
]);

function mediaFiles(): string[] {
  return readdirSync(MEDIA_DIR).filter((name) => !name.startsWith("."));
}

function bytesOf(name: string): number {
  return statSync(join(MEDIA_DIR, name)).size;
}

describe("public/media weight", () => {
  it("ships nothing over the budget that has not been argued for", () => {
    const over = mediaFiles()
      .filter((name) => bytesOf(name) > MAX_BYTES)
      .filter((name) => !OVERSIZED_ON_PURPOSE.has(name))
      .map((name) => `${name} (${(bytesOf(name) / 1_048_576).toFixed(2)}MB)`);

    expect(
      over,
      `these are over ${(MAX_BYTES / 1_048_576).toFixed(1)}MB. A five second hero clip ` +
        "needs well under that: re-encode with libx264, profile high, CRF 23, maxrate " +
        "1500k, -an to strip audio from a muted video, and +faststart. If a file genuinely " +
        "has to be this big, add it to OVERSIZED_ON_PURPOSE with the reason.",
    ).toEqual([]);
  });

  it("holds no exemption for a file that has gone or no longer needs one", () => {
    const present = new Set(mediaFiles());
    for (const [name, reason] of OVERSIZED_ON_PURPOSE) {
      expect(reason.length, `${name} needs its reason written out`).toBeGreaterThan(30);
      expect(present.has(name), `${name} is exempted but is not in public/media`).toBe(true);
      expect(
        bytesOf(name),
        `${name} is now under the budget, so its exemption is obsolete. Remove it.`,
      ).toBeGreaterThan(MAX_BYTES);
    }
  });

  /**
   * The four hero films are the ones that took the site down, so they are held to a
   * tighter figure than the general ceiling rather than merely passing it.
   */
  it("keeps every audience hero film under a megabyte", () => {
    const heroes = mediaFiles().filter(
      (name) => name.startsWith("halo-") && name.endsWith(".mp4"),
    );
    expect(heroes.length, "the four audience hero films should be here").toBe(4);

    const heavy = heroes
      .filter((name) => bytesOf(name) > 1_000_000)
      .map((name) => `${name} (${(bytesOf(name) / 1_048_576).toFixed(2)}MB)`);

    expect(
      heavy,
      "an audience hero film is the first thing a phone downloads on the page paid ads " +
        "point at. It was 7MB once and that killed iOS Safari.",
    ).toEqual([]);
  });
});

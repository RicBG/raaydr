#!/usr/bin/env bash
#
# Fetch and build the four How It Works card images.
#
# This exists because the asset host is not reachable from the sandbox the
# cards were built in: the egress proxy answers 403 at CONNECT for
# d8j0ntlcm91z4.cloudfront.net, the same as it does for any host outside the
# session allowlist. Run this anywhere with normal outbound access and the
# files land exactly where lib/howItWorks.ts already points.
#
#   bash scripts/fetch-how-it-works-assets.sh
#
# Needs: curl, ffmpeg, and the repo's node_modules (it uses sharp, which is
# already a transitive dependency, so npm install is enough).
#
# Output: four webp files in public/how-it-works/, long edge 1600, quality 80,
# untreated. Every bit of colour treatment is CSS in
# components/sections/HowItWorksBento.module.css and must stay there, so that
# a replacement image can be dropped in without carrying a baked-in grade.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public/how-it-works"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3GM8XGg5RqnoXPKqjhB45URPaax"

echo "==> downloading"
curl -fsSL -o "$TMP/listeners.png"   "$BASE/hf_20260711_210632_7da2b7c8-d287-477b-80b5-5d06dbe4c306.png"
curl -fsSL -o "$TMP/tastemakers.png" "$BASE/hf_20260711_210624_f6a3b745-a3cc-4cf5-9fa0-ee5ee88a1c24.png"
curl -fsSL -o "$TMP/artists.png"     "$BASE/hf_20260711_125735_0dc0ef04-9fbd-4886-8ee4-33d96556f1e2.png"
curl -fsSL -o "$TMP/credits.mp4"     "$BASE/hf_20260712_140215_790edc8c-f038-4cfb-b301-77f650d3edab.mp4"

# The credits card is a still from the clip: hands on the drum machine under
# the lamp, which is on screen at about 4.5 seconds.
echo "==> extracting the credits still at 4.5s"
ffmpeg -y -loglevel error -ss 4.5 -i "$TMP/credits.mp4" -frames:v 1 "$TMP/credits.png"

echo "==> converting to webp"
mkdir -p "$OUT"
node -e '
const sharp = require("sharp");
const path = require("path");
const tmp = process.argv[1], out = process.argv[2];
const jobs = ["listeners", "artists", "tastemakers", "credits"];
(async () => {
  for (const name of jobs) {
    const src = path.join(tmp, name + ".png");
    const dest = path.join(out, "hiw-" + name + ".webp");
    const meta = await sharp(src).metadata();
    // Resize by the long edge so portrait and landscape sources both land at
    // 1600 on their longest side.
    const resize = meta.width >= meta.height ? { width: 1600 } : { height: 1600 };
    await sharp(src).resize({ ...resize, withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(dest);
    const after = await sharp(dest).metadata();
    console.log(`   hiw-${name}.webp  ${after.width}x${after.height}`);
  }
})();
' "$TMP" "$OUT"

echo "==> done"
ls -la "$OUT"/hiw-*.webp

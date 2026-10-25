import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The social share card, `work_items` 257: 1200 by 630, drawn from the SocialCard board.
 *
 * It replaces `public/og.png`, which still said "The music industry forgot who makes the music".
 * Built as code so the headline, the mark and the fonts cannot drift from the site.
 *
 * THE FONTS ARE THE SITE'S OWN, converted from the shipped woff2 to woff in `assets/og`, because
 * the renderer behind `ImageResponse` reads ttf, otf and woff but not woff2. Clash Display for
 * the headline and wordmark, General Sans for the small lines, Space Mono for the eyebrow. The
 * canvas board used stand-in faces; its layout is what this follows, not its typefaces.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "RAAYDR. Music streaming is broken. We fixed it. Now everyone wins.";

const MARK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="84" height="84">' +
  '<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="12" y1="20" x2="12" y2="4">' +
  '<stop offset="0%" stop-color="#7C4DFF"/><stop offset="100%" stop-color="#3FC8D6"/></linearGradient></defs>' +
  '<g fill="url(#g)"><rect x="3" y="8" width="2" height="8" rx="1"/><rect x="8" y="4" width="2" height="16" rx="1"/>' +
  '<rect x="13" y="6" width="2" height="12" rx="1"/><rect x="18" y="9" width="2" height="6" rx="1"/></g></svg>';

const MARK_SRC = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

async function font(file: string) {
  return readFile(join(process.cwd(), "assets", "og", file));
}

export async function renderOgCard() {
  const [clash, general, mono] = await Promise.all([
    font("ClashDisplay-Semibold.woff"),
    font("GeneralSans-Medium.woff"),
    font("SpaceMono-Regular.woff"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          position: "relative",
          background: "#F5F2EC",
          color: "#15151A",
          fontFamily: "General Sans",
        }}
      >
        {/* The soft violet and cyan orb on the right. */}
        <div
          style={{
            position: "absolute",
            right: -60,
            top: 60,
            width: 520,
            height: 520,
            backgroundImage:
              "radial-gradient(circle at 35% 35%, rgba(185,168,255,0.95) 0%, rgba(185,168,255,0) 46%), radial-gradient(circle at 70% 62%, rgba(143,227,234,0.95) 0%, rgba(143,227,234,0) 46%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by satori, not the browser */}
          <img src={MARK_SRC} width={42} height={42} alt="" />
          <div
            style={{
              fontFamily: "Clash Display",
              fontSize: 40,
              letterSpacing: "0.01em",
              display: "flex",
            }}
          >
            RAAYDR.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            maxWidth: 780,
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "Clash Display",
              fontSize: 68,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            Music streaming is broken. We fixed it. Now everyone wins.
          </div>
          <div
            style={{
              fontFamily: "Space Mono",
              fontSize: 18,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#3A3A42",
              display: "flex",
            }}
          >
            <span style={{ color: "#2E9E60", marginRight: 10 }}>{"//"}</span>
            <span>Attention pays</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#55555E",
            position: "relative",
          }}
        >
          <div style={{ display: "flex" }}>raaydr.com</div>
          <div
            style={{
              display: "flex",
              padding: "12px 22px",
              borderRadius: 9999,
              background: "#15151A",
              color: "#F5F2EC",
              fontSize: 20,
            }}
          >
            Join the free waitlist
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Clash Display", data: clash, weight: 600, style: "normal" },
        { name: "General Sans", data: general, weight: 500, style: "normal" },
        { name: "Space Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}

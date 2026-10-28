import { ImageResponse } from "next/og";
import {
  REFERRAL_CURRENCIES,
  clampReferred,
  listeners,
  money,
  referralFigures,
  rewardLabel,
  type ReferralCurrency,
} from "@/lib/referralCalculator";

/**
 * The referral calculator as a square image for socials, for Bumblebee. `work_items` 401.
 *
 * `/tools/referral-calculator/social?n=100&c=gbp` returns a 1080 by 1080 PNG with that many
 * listeners worked out. Every figure on it comes from `referralFigures`, the same function the page
 * and the slider read, so the image cannot say something the calculator does not. `n` is any whole
 * number (no cap; a bad one is zero) and `c` is gbp, usd or eur. Nothing is stored and nothing is
 * read: it is arithmetic on the query string.
 *
 * It states the rule in its own words at the foot, because an image is passed around without the
 * page: a pound a month per listener, for as long as they stay subscribed, no limit. The yearly line
 * says "if they all stay subscribed", as the page does.
 */
export const runtime = "nodejs";

const SIZE = 1080;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const n = clampReferred(Number(params.get("n") ?? 100));
  const asked = params.get("c") ?? "gbp";
  const currency: ReferralCurrency = (REFERRAL_CURRENCIES as readonly string[]).includes(asked)
    ? (asked as ReferralCurrency)
    : "gbp";
  const f = referralFigures(n, currency);

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 88,
          background: "#14101F",
          color: "#F5F2EC",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, letterSpacing: 6, color: "#63F2EB" }}>RAAYDR</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 56, color: "#C9C4D6" }}>
            {`Refer ${listeners(f.referred)}`}
          </div>
          <div style={{ display: "flex", fontSize: 200, fontWeight: 700, lineHeight: 1.05, marginTop: 12 }}>
            {money(f.monthlyMinor, currency)}
          </div>
          <div style={{ display: "flex", fontSize: 52, color: "#63F2EB", marginTop: 4 }}>a month</div>
          <div style={{ display: "flex", fontSize: 40, color: "#C9C4D6", marginTop: 36 }}>
            {`${money(f.yearlyMinor, currency)} a year, if they all stay subscribed`}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 32, lineHeight: 1.4, color: "#C9C4D6" }}>
          {`${rewardLabel(currency)} a month for every listener you refer, for as long as they stay subscribed. No limit on how many.`}
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}

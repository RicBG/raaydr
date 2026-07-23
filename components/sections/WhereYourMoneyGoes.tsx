"use client";

import { useMemo, useState } from "react";
import { PER_FAN, PRICING, SPLIT, type RatesTier } from "@/lib/raaydrRates";
import styles from "./WhereYourMoneyGoes.module.css";

// Where a listener's subscription goes. Percentages only, no pound figures.
// The bar is monochrome (graduated ink tints) so it adds no role colour and
// no extra Signal Green, per the design constraints.
const TIER_LABEL: Record<RatesTier, string> = {
  dayOne: `Day Ones · £${PRICING.dayOne}`,
  standard: `Standard · £${PRICING.standard}`,
};

const INK = (a: number) => `color-mix(in srgb, var(--ink) ${a}%, transparent)`;

export default function WhereYourMoneyGoes() {
  const [tier, setTier] = useState<RatesTier>("standard");

  const segments = useMemo(() => {
    const price = PRICING[tier];
    // Distributable revenue is what the 55/15/30 split is a share of. Back it
    // out of the locked per-fan artist figure, then costs are the remainder.
    const distributable = PER_FAN.artist[tier] / (SPLIT.artists / 100);
    const costsPct = Math.max(0, ((price - distributable) / price) * 100);
    const rest = 100 - costsPct;
    return [
      {
        key: "artists",
        name: "Artists",
        label: `${SPLIT.artists}%`,
        width: (rest * SPLIT.artists) / 100,
        shade: INK(82),
      },
      {
        key: "raaydr",
        name: "RAAYDR",
        label: `${SPLIT.raaydr}%`,
        width: (rest * SPLIT.raaydr) / 100,
        shade: INK(52),
      },
      {
        key: "tastemakers",
        name: "Tastemakers",
        label: `up to ${SPLIT.tastemakers}%`,
        width: (rest * SPLIT.tastemakers) / 100,
        shade: INK(34),
      },
      {
        key: "costs",
        name: "Tax, publishing royalties, card fees",
        label: `${Math.round(costsPct)}%`,
        width: costsPct,
        shade: INK(16),
      },
    ];
  }, [tier]);

  return (
    <div className={styles.wrap}>
      <div className={styles.tierToggle} role="radiogroup" aria-label="Your tier">
        {(["dayOne", "standard"] as const).map((t) => (
          <label
            key={t}
            className={`${styles.tierSegment} ${tier === t ? styles.tierSegmentOn : ""}`}
          >
            <input
              type="radio"
              name="wymg-tier"
              value={t}
              checked={tier === t}
              onChange={() => setTier(t)}
              style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
            />
            {TIER_LABEL[t]}
          </label>
        ))}
      </div>

      <div
        className={styles.bar}
        role="img"
        aria-label="Where your subscription goes: artists 55 percent, RAAYDR 30 percent, tastemakers up to 15 percent, of your subscription after tax, publishing royalties and card fees."
      >
        {segments.map((s) => (
          <div
            key={s.key}
            className={styles.segment}
            style={{ width: `${s.width}%`, background: s.shade }}
          />
        ))}
      </div>

      <div className={styles.legend}>
        {segments.map((s) => (
          <div key={s.key} className={styles.legendRow}>
            <span className={styles.swatch} style={{ background: s.shade }} />
            <span className={styles.legendName}>{s.name}</span>
            <span className={styles.legendPct}>{s.label}</span>
          </div>
        ))}
      </div>

      <p className={styles.note}>
        Artists, RAAYDR and tastemakers are shares of your subscription after
        tax, publishing royalties and card fees. Whatever the tastemaker fund
        does not pay out goes to the artists.
      </p>

      <p className={styles.caption}>
        Every month you will see exactly which artists and tastemakers your
        money went to. By name.
      </p>
    </div>
  );
}

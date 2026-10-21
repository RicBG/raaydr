"use client";

import { useMemo, useState } from "react";
import {
  PRICING_TIERS,
  PRICING_TIER_DEFAULT,
  TIER_LABEL,
  type PricingTier,
} from "@/lib/calculator";
import { PER_FAN, PRICING, SPLIT } from "@/lib/raaydrRates";
import styles from "./WhereYourMoneyGoes.module.css";

// Where a listener's subscription goes, in two steps. Percentages only, no pound figures.
// Each segment carries the palette colour of whoever it pays: artists amber,
// RAAYDR its own green, tastemakers orchid. The deductions are not an audience
// and no longer borrow one: they take --deduction, a neutral, because money
// leaving the system should read as absence rather than as somebody's colour.
// The tier list, its order and its labels are shared with the calculators.

export default function WhereYourMoneyGoes() {
  const [tier, setTier] = useState<PricingTier>(PRICING_TIER_DEFAULT);

  // Two steps, because the shares are not shares of the subscription. Costs come off
  // first; the 55 / 10 / 35 split is a split of what is left. One bar of all four read as
  // 135%. Every figure here comes from the rates file: the costs share is whatever the
  // distributable figure leaves out of the price, never a typed number.
  const { costsLabel, leftLabel, costsWidth, split } = useMemo(() => {
    const price = PRICING[tier];
    // Distributable revenue is what the 55/10/35 split is a share of. Back it
    // out of the locked per-fan artist figure, then costs are the remainder.
    const distributable = PER_FAN.artist[tier] / (SPLIT.artists / 100);
    const costsPct = Math.max(0, ((price - distributable) / price) * 100);
    const costsLabel = Math.round(costsPct);
    return {
      costsLabel,
      // Both labels are whole numbers that add to 100, so the two steps agree on screen.
      leftLabel: 100 - costsLabel,
      costsWidth: costsPct,
      split: [
        {
          key: "artists",
          name: "Artists",
          label: `${SPLIT.artists}%`,
          width: SPLIT.artists,
          shade: "var(--amber)",
        },
        {
          key: "tastemakers",
          name: "Tastemakers",
          label: `up to ${SPLIT.tastemakers}%`,
          width: SPLIT.tastemakers,
          shade: "var(--orchid)",
        },
        {
          key: "raaydr",
          name: "RAAYDR",
          label: `${SPLIT.raaydr}%`,
          width: SPLIT.raaydr,
          shade: "var(--green)",
        },
      ],
    };
  }, [tier]);

  return (
    <div className={styles.wrap}>
      <div className={styles.tierToggle} role="radiogroup" aria-label="Your tier">
        {PRICING_TIERS.map((t) => (
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

      <div className={styles.step}>
        <p className={styles.stepLabel}>
          <span className={styles.stepNumber}>Step 1</span> Tax, publishing
          royalties and card fees come off first
        </p>
        <div
          className={styles.bar}
          role="img"
          aria-label={`Step 1: tax, publishing royalties and card fees take about ${costsLabel} percent of your subscription. About ${leftLabel} percent is left to share.`}
        >
          <div
            className={styles.segment}
            style={{ width: `${costsWidth}%`, background: "var(--deduction)" }}
          />
          <div
            className={styles.segment}
            style={{ width: `${100 - costsWidth}%`, background: "var(--remainder)" }}
          />
        </div>
        <div className={styles.legend}>
          <div className={styles.legendRow}>
            <span className={styles.swatch} style={{ background: "var(--deduction)" }} />
            <span className={styles.legendName}>
              Tax, publishing royalties, card fees
            </span>
            <span className={styles.legendPct}>about {costsLabel}%</span>
          </div>
          <div className={styles.legendRow}>
            <span className={styles.swatch} style={{ background: "var(--remainder)" }} />
            <span className={styles.legendName}>What is left to share</span>
            <span className={styles.legendPct}>about {leftLabel}%</span>
          </div>
        </div>
      </div>

      <div className={styles.step}>
        <p className={styles.stepLabel}>
          <span className={styles.stepNumber}>Step 2</span> What is left splits
          three ways
        </p>
        <div
          className={styles.bar}
          role="img"
          aria-label={`Step 2: of what is left, artists ${SPLIT.artists} percent, tastemakers up to ${SPLIT.tastemakers} percent, RAAYDR ${SPLIT.raaydr} percent.`}
        >
          {split.map((s) => (
            <div
              key={s.key}
              className={styles.segment}
              style={{ width: `${s.width}%`, background: s.shade }}
            />
          ))}
        </div>
        <div className={styles.legend}>
          {split.map((s) => (
            <div key={s.key} className={styles.legendRow}>
              <span className={styles.swatch} style={{ background: s.shade }} />
              <span className={styles.legendName}>{s.name}</span>
              <span className={styles.legendPct}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className={styles.note}>
        The three shares are shares of what is left in step 1, not of your whole
        subscription, and they add up to 100%. Whatever the tastemaker fund does
        not pay out goes to the artists.
      </p>

      <p className={styles.caption}>
        Every month you will see exactly which artists and tastemakers your
        money went to. By name.
      </p>
    </div>
  );
}

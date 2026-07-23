"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import {
  sliderToFans,
  tastemakerMonthly,
  type PricingTier,
} from "@/lib/calculator";
import { PRICING } from "@/lib/raaydrRates";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./Calculator.module.css";

const gbp = (v: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: v >= 100 ? 0 : 2,
    minimumFractionDigits: v >= 100 ? 0 : 2,
  }).format(v);

const count = (v: number) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(v);

// Second input presets: the share of a follower's listening the tastemaker
// actually drove.
const DRIVEN_PRESETS = [
  { label: "Quiet", value: 10 },
  { label: "Solid", value: 25 },
  { label: "Dominant", value: 45 },
] as const;

const TIER_LABEL: Record<PricingTier, string> = {
  dayOne: `Day Ones · £${PRICING.dayOne}`,
  standard: `Standard · £${PRICING.standard}`,
};

export default function TastemakerCalculator() {
  const id = useId();
  const reduced = usePrefersReducedMotion();

  const [fanPos, setFanPos] = useState(0.5); // log slider → 1,000 followers
  const [driven, setDriven] = useState(25); // Solid, the middle preset
  const [tier, setTier] = useState<PricingTier>("standard");

  const fans = sliderToFans(fanPos);
  const values = useMemo(() => {
    const earningsM = tastemakerMonthly(fans, driven / 100, tier);
    return { earningsM, earningsY: earningsM * 12 };
  }, [fans, driven, tier]);

  // Same GSAP counter-tween pattern as the homepage calculator: numbers
  // glide, painted straight to the DOM so React doesn't re-render per frame.
  const display = useRef({ ...values });
  const earningsMEl = useRef<HTMLSpanElement>(null);
  const earningsYEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const paint = () => {
      const d = display.current;
      if (earningsMEl.current)
        earningsMEl.current.textContent = gbp(d.earningsM);
      if (earningsYEl.current)
        earningsYEl.current.textContent = `${gbp(d.earningsY)} a year`;
    };

    if (reduced) {
      Object.assign(display.current, values);
      paint();
      return;
    }

    const tween = gsap.to(display.current, {
      ...values,
      duration: 0.4,
      ease: "power2.out",
      overwrite: true,
      onUpdate: paint,
    });
    return () => {
      tween.kill();
    };
  }, [values, reduced]);

  return (
    <div className={styles.calculator}>
      <div className={styles.controls}>
        <div className={styles.control}>
          <div className={styles.tierToggle} role="radiogroup" aria-label="Pricing tier">
            {(["dayOne", "standard"] as const).map((t) => (
              <label
                key={t}
                className={`${styles.tierSegment} ${tier === t ? styles.tierSegmentOn : ""}`}
              >
                <input
                  type="radio"
                  name={`${id}-tier`}
                  value={t}
                  checked={tier === t}
                  onChange={() => setTier(t)}
                />
                {TIER_LABEL[t]}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-fans`}>People who follow your picks</label>
            <output htmlFor={`${id}-fans`} className="mono-figure">
              {count(fans)}
            </output>
          </div>
          <input
            id={`${id}-fans`}
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={fanPos}
            aria-valuetext={`${count(fans)} people`}
            onChange={(e) => setFanPos(Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-driven`}>
              How much of their listening you actually drive
            </label>
            <output htmlFor={`${id}-driven`} className="mono-figure">
              {driven}%
            </output>
          </div>
          <div className={styles.tierToggle} role="group" aria-label="Driven share presets">
            {DRIVEN_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`${styles.tierSegment} ${driven === p.value ? styles.tierSegmentOn : ""}`}
                aria-pressed={driven === p.value}
                onClick={() => setDriven(p.value)}
              >
                {p.label} {p.value}%
              </button>
            ))}
          </div>
          <input
            id={`${id}-driven`}
            type="range"
            min={5}
            max={100}
            step={1}
            value={driven}
            onChange={(e) => setDriven(Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>

      <div className={`${styles.results} ${styles.resultsSingle}`}>
        <div className={`${styles.panel} ${styles.raaydr}`}>
          <p className={styles.panelName}>
            Tastemaker earnings
            <span className={styles.panelSub}>from the ring-fenced fund</span>
          </p>
          <p className={`mono-figure ${styles.figure}`}>
            <span ref={earningsMEl}>{gbp(values.earningsM)}</span>
            <span className={styles.per}>/month</span>
          </p>
          <p className={`mono-figure ${styles.annual}`}>
            <span ref={earningsYEl}>{gbp(values.earningsY)} a year</span>
          </p>
          <p className={styles.helper}>
            Drawn from the ring-fenced tastemaker fund. You earn on what you
            actually drive, so this is what you build toward, not what you start
            at.
          </p>
        </div>
      </div>

      <p className={styles.footnote}>
        Illustrative estimate, not a guarantee. Up to 15% of every subscription,
        after tax, publishing royalties and card fees, is ring fenced for
        tastemakers, and you earn from it in proportion to the listening you
        actually drive. Figures are projections based on your inputs, not a
        guarantee.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import {
  sliderToFans,
  tastemakerMonthly,
  tastemakerPerFan,
  type PricingTier,
} from "@/lib/calculator";
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

export default function TastemakerCalculator() {
  const id = useId();
  const reduced = usePrefersReducedMotion();

  // Same defaults as the homepage calculator: 1,000 fans (fanPos 0.5 on the
  // log slider), 40% attention.
  const [fanPos, setFanPos] = useState(0.5);
  const [attention, setAttention] = useState(40);
  const [tier, setTier] = useState<PricingTier>("founding");

  const fans = sliderToFans(fanPos);
  const values = useMemo(() => {
    const earningsM = tastemakerMonthly(fans, attention / 100, tier);
    return { earningsM, earningsY: earningsM * 12 };
  }, [fans, attention, tier]);

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
            {(["founding", "standard"] as const).map((t) => (
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
                {t === "founding" ? "Founding · £5.99" : "Standard · £7.99"}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-fans`}>
              People who follow your picks
            </label>
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
            <label htmlFor={`${id}-attention`}>
              How much of their attention goes to what you surfaced
            </label>
            <output htmlFor={`${id}-attention`} className="mono-figure">
              {attention}%
            </output>
          </div>
          <input
            id={`${id}-attention`}
            type="range"
            min={5}
            max={100}
            step={1}
            value={attention}
            onChange={(e) => setAttention(Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>

      <div className={`${styles.results} ${styles.resultsSingle}`}>
        <div className={`${styles.panel} ${styles.raaydr}`}>
          <p className={styles.panelName}>
            Tastemaker earnings
            <span className={styles.panelSub}>from the ringfenced fund</span>
          </p>
          <p className={`mono-figure ${styles.figure}`}>
            <span ref={earningsMEl}>{gbp(values.earningsM)}</span>
            <span className={styles.per}>/month</span>
          </p>
          <p className={`mono-figure ${styles.annual}`}>
            <span ref={earningsYEl}>{gbp(values.earningsY)} a year</span>
          </p>
          <p className={`mono-figure ${styles.basis}`}>
            Based on {gbp(tastemakerPerFan(tier))}/fan/month ringfenced for
            tastemakers at the {tier} tier.
          </p>
        </div>
      </div>

      <p className={styles.footnote}>
        Illustrative estimate, not a guarantee. The tastemaker fund is a
        shared pool across everyone finding music first — this treats your
        share as a simple fraction of fans × attention, not a literal model
        of how the fund is actually divided. Founding tier assumes £5.99/
        month, standard assumes £7.99; both before payment processing.
      </p>
    </div>
  );
}

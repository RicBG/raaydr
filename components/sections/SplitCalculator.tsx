"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import {
  raaydrMonthly,
  sliderToFans,
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

type Role = "Producer" | "Songwriter";

type SplitCalculatorProps = {
  /** Default role shown on load. The maths is identical either way — this
   *  is a copy-only toggle, since one instance covers both roles. */
  defaultRole?: Role;
  /** Default split percentage the artist has agreed to pay per song. */
  defaultSplit?: number;
};

export default function SplitCalculator({
  defaultRole = "Producer",
  defaultSplit = 25,
}: SplitCalculatorProps) {
  const id = useId();
  const reduced = usePrefersReducedMotion();

  const [role, setRole] = useState<Role>(defaultRole);
  // Same defaults as the homepage calculator: 1,000 fans (fanPos 0.5 on the
  // log slider), 40% attention.
  const [fanPos, setFanPos] = useState(0.5);
  const [attention, setAttention] = useState(40);
  const [splitPercent, setSplitPercent] = useState(defaultSplit);
  const [tier, setTier] = useState<PricingTier>("founding");

  const fans = sliderToFans(fanPos);
  const values = useMemo(() => {
    const artistM = raaydrMonthly(fans, attention / 100, tier);
    const shareM = artistM * (splitPercent / 100);
    return { artistM, shareM, shareY: shareM * 12 };
  }, [fans, attention, splitPercent, tier]);

  // Same GSAP counter-tween pattern as the homepage calculator: numbers
  // glide, painted straight to the DOM so React doesn't re-render per frame.
  const display = useRef({ ...values });
  const shareMEl = useRef<HTMLSpanElement>(null);
  const shareYEl = useRef<HTMLSpanElement>(null);
  const artistMEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const paint = () => {
      const d = display.current;
      if (shareMEl.current) shareMEl.current.textContent = gbp(d.shareM);
      if (shareYEl.current)
        shareYEl.current.textContent = `${gbp(d.shareY)} a year`;
      if (artistMEl.current) artistMEl.current.textContent = gbp(d.artistM);
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
          <div className={styles.tierToggle} role="radiogroup" aria-label="Your role">
            {(["Producer", "Songwriter"] as const).map((r) => (
              <label
                key={r}
                className={`${styles.tierSegment} ${role === r ? styles.tierSegmentOn : ""}`}
              >
                <input
                  type="radio"
                  name={`${id}-role`}
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                />
                {r}
              </label>
            ))}
          </div>
        </div>

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
              People who genuinely rate this artist
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
              How much of their attention is this artist&rsquo;s
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

        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-split`}>
              The split this artist has agreed to pay you, per song
            </label>
            <output htmlFor={`${id}-split`} className="mono-figure">
              {splitPercent}%
            </output>
          </div>
          <input
            id={`${id}-split`}
            type="range"
            min={0}
            max={100}
            step={1}
            value={splitPercent}
            onChange={(e) => setSplitPercent(Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>

      <div className={`${styles.results} ${styles.resultsSingle}`}>
        <div className={`${styles.panel} ${styles.raaydr}`}>
          <p className={styles.panelName}>
            {role} earnings
            <span className={styles.panelSub}>on this one collaboration</span>
          </p>
          <p className={`mono-figure ${styles.figure}`}>
            <span ref={shareMEl}>{gbp(values.shareM)}</span>
            <span className={styles.per}>/month</span>
          </p>
          <p className={`mono-figure ${styles.annual}`}>
            <span ref={shareYEl}>{gbp(values.shareY)} a year</span>
          </p>
          <p className={`mono-figure ${styles.basis}`}>
            Based on <span ref={artistMEl}>{gbp(values.artistM)}</span>{" "}
            /month in this artist&rsquo;s own RAAYDR earnings, at your{" "}
            {splitPercent}% split.
          </p>
        </div>
      </div>

      <p className={styles.footnote}>
        Illustrative estimate, not a guarantee. This is a per-song, per-artist
        figure — if you work with several artists, run this once for each
        collaboration rather than treating it as a single blended platform
        income. Founding tier assumes £5.99/month, standard assumes £7.99;
        both before payment processing. The split percentage is whatever
        you&rsquo;ve agreed with the artist for this song — RAAYDR doesn&rsquo;t
        set or enforce it.
      </p>
    </div>
  );
}

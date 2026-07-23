"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { sliderToFans } from "@/lib/calculator";
import { ATTENTION_DEFAULT, PER_FAN } from "@/lib/raaydrRates";
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
  defaultSplit = 30,
}: SplitCalculatorProps) {
  const id = useId();
  const reduced = usePrefersReducedMotion();

  const [role, setRole] = useState<Role>(defaultRole);
  const [fanPos, setFanPos] = useState(0.5); // log slider → 1,000 fans
  const [splitPercent, setSplitPercent] = useState(defaultSplit);

  // This calculator is scoped to a single song: attention is fixed at the
  // Committed default and the tier at standard (both hidden), and catalogue
  // share is 100% by definition, so there is nothing to expose as a control.
  const fans = sliderToFans(fanPos);
  const values = useMemo(() => {
    const songM = fans * (ATTENTION_DEFAULT / 100) * PER_FAN.artist.standard;
    const shareM = songM * (splitPercent / 100);
    return { songM, shareM, shareY: shareM * 12 };
  }, [fans, splitPercent]);

  // Same GSAP counter-tween pattern as the homepage calculator: numbers
  // glide, painted straight to the DOM so React doesn't re-render per frame.
  const display = useRef({ ...values });
  const shareMEl = useRef<HTMLSpanElement>(null);
  const shareYEl = useRef<HTMLSpanElement>(null);
  const songMEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const paint = () => {
      const d = display.current;
      if (shareMEl.current) shareMEl.current.textContent = gbp(d.shareM);
      if (shareYEl.current)
        shareYEl.current.textContent = `${gbp(d.shareY)} a year`;
      if (songMEl.current) songMEl.current.textContent = gbp(d.songM);
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
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-fans`}>People who have this song on repeat</label>
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
            <label htmlFor={`${id}-split`}>Your split on this song</label>
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
            <span className={styles.panelSub}>on this one song</span>
          </p>
          <p className={`mono-figure ${styles.figure}`}>
            <span ref={shareMEl}>{gbp(values.shareM)}</span>
            <span className={styles.per}>/month</span>
          </p>
          <p className={`mono-figure ${styles.annual}`}>
            <span ref={shareYEl}>{gbp(values.shareY)} a year</span>
          </p>
          <p className={`mono-figure ${styles.basis}`}>
            Based on this song earning roughly{" "}
            <span ref={songMEl}>{gbp(values.songM)}</span>/month on RAAYDR, at
            your {splitPercent}% split.
          </p>
        </div>
      </div>

      <p className={styles.footnote}>
        Illustrative estimate, not a guarantee. This is a per-song figure. If
        you&rsquo;re credited on more than one song, run this once per song
        rather than treating it as a single blended platform income. The split
        percentage is whatever you&rsquo;ve agreed with the artist for this
        song. RAAYDR doesn&rsquo;t set or enforce it.
      </p>
    </div>
  );
}

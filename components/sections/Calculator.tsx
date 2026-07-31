"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import {
  milestone,
  raaydrMonthly,
  sliderToFans,
  PRICING_TIERS,
  PRICING_TIER_DEFAULT,
  TIER_LABEL,
  type PricingTier,
} from "@/lib/calculator";
import {
  ATTENTION_DEFAULT,
  ATTENTION_PRESETS,
  MODELLED_SHARE_NOTE,
  SPOTIFY,
  spotifyEngagedFanEarnings,
} from "@/lib/raaydrRates";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import Glyph from "@/components/Glyph";
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

const ATTENTION_TICKS = [10, 25, 50, 75, 100];

type CalculatorProps = {
  /** Render the illustrative-estimate disclaimer inside the component. The
   *  homepage leaves this off because its RealNumbers section supplies its
   *  own footnote; standalone placements (the artist page) turn it on. */
  disclaimer?: boolean;
};

export default function Calculator({ disclaimer = false }: CalculatorProps) {
  const id = useId();
  const reduced = usePrefersReducedMotion();

  const [fanPos, setFanPos] = useState(0.5); // log position → 1,000 fans
  const [attention, setAttention] = useState(ATTENTION_DEFAULT); // percent
  const [tier, setTier] = useState<PricingTier>(PRICING_TIER_DEFAULT);

  const fans = sliderToFans(fanPos);
  // Both panels price the SAME people behaving the SAME way: the attention
  // share applies to each side. That is the whole point of this comparison,
  // and it is why the multiple sits at a constant 15x instead of climbing
  // from 30x to 119x as the attention slider moves.
  //
  // Do not swap the Spotify side for spotifyMonthlyEarnings(). That prices a
  // bare monthly listener, ignores attention entirely, and silently changes
  // the population halfway through the comparison.
  const values = useMemo(() => {
    const raaydrM = raaydrMonthly(fans, attention / 100, tier);
    return {
      raaydrM,
      raaydrY: raaydrM * 12,
      spotifyM: spotifyEngagedFanEarnings(fans, attention),
    };
  }, [fans, attention, tier]);

  const cap = milestone(values.raaydrY);

  // GSAP counter tween: numbers glide ~0.4s, painted straight to the DOM so
  // React never re-renders per frame.
  const display = useRef({ ...values });
  const spotifyMEl = useRef<HTMLSpanElement>(null);
  const raaydrMEl = useRef<HTMLSpanElement>(null);
  const raaydrYEl = useRef<HTMLSpanElement>(null);
  const fansEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const paint = () => {
      const d = display.current;
      if (spotifyMEl.current) spotifyMEl.current.textContent = gbp(d.spotifyM);
      if (raaydrMEl.current) raaydrMEl.current.textContent = gbp(d.raaydrM);
      if (raaydrYEl.current)
        raaydrYEl.current.textContent = `${gbp(d.raaydrY)} a year`;
      if (fansEl.current) fansEl.current.textContent = count(fans);
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
  }, [values, reduced, fans]);

  return (
    <div className={styles.calculator}>
      <div className={styles.controls}>
        <div className={styles.control}>
          <div className={styles.controlHead}>
            <p className={styles.groupLabel} id={`${id}-tier-label`}>
              What your fans are paying
            </p>
          </div>
          <div
            className={styles.tierToggle}
            role="radiogroup"
            aria-labelledby={`${id}-tier-label`}
          >
            {PRICING_TIERS.map((t) => (
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
          <p className={styles.helper}>
            Day Ones lock a lower price forever, so a Day One fan sends less
            your way than a standard subscriber does. Standard is the steady
            state, which is why it&rsquo;s the default here.
          </p>
        </div>

        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor="calc-fans">People who genuinely rate you</label>
            <output htmlFor="calc-fans" className="mono-figure">
              {count(fans)}
            </output>
          </div>
          <input
            id="calc-fans"
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
            <label htmlFor="calc-attention" className={styles.labelWithGlyph}>
              <Glyph name="attention-dial" size={40} className={styles.attentionGlyph} />
              How much of their attention is yours
            </label>
            <output htmlFor="calc-attention" className="mono-figure">
              {attention}%
            </output>
          </div>
          <div className={styles.tierToggle} role="group" aria-label="Attention share presets">
            {ATTENTION_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`${styles.tierSegment} ${attention === p.value ? styles.tierSegmentOn : ""}`}
                aria-pressed={attention === p.value}
                onClick={() => setAttention(p.value)}
              >
                {p.label} {p.value}%
              </button>
            ))}
          </div>
          <input
            id="calc-attention"
            type="range"
            min={5}
            max={100}
            step={1}
            value={attention}
            onChange={(e) => setAttention(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.ticks} aria-hidden="true">
            {ATTENTION_TICKS.map((t) => (
              <span
                key={t}
                className="mono-figure"
                style={{ left: `${((t - 5) / 95) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>
          <p className={styles.helper}>
            Attention share is your slice of each fan&rsquo;s total listening.
            40% means you are close to half of everything that person plays. It
            happens. It is not the average. {MODELLED_SHARE_NOTE.attention}
          </p>
        </div>
      </div>

      <div className={styles.results}>
        <div className={`${styles.panel} ${styles.spotify}`}>
          <p className={styles.panelName}>
            Spotify
            <span className={styles.panelSub}>
              the same people, paid per stream
            </span>
          </p>
          <p className={`mono-figure ${styles.figure}`}>
            <span ref={spotifyMEl}>{gbp(values.spotifyM)}</span>
            <span className={styles.per}>/month</span>
          </p>
        </div>

        <div className={`${styles.panel} ${styles.raaydr}`}>
          <p className={styles.panelName}>
            RAAYDR
            <span className={styles.panelSub}>
              the same people, paid for attention
            </span>
          </p>
          <p className={`mono-figure ${styles.figure}`}>
            <span ref={raaydrMEl}>{gbp(values.raaydrM)}</span>
            <span className={styles.per}>/month</span>
          </p>
          <p className={`mono-figure ${styles.annual}`}>
            <span ref={raaydrYEl}>{gbp(values.raaydrY)} a year</span>
          </p>
          <p className={`mono-figure ${styles.milestone}`}>
            <span key={cap} className={styles.milestoneWord}>
              {cap}
            </span>
          </p>
        </div>

        {/* Both sides are the same population at the same attention share, so
            this states what is being held constant rather than converting one
            unit into another. The old line here compared these fans against a
            count of bare Spotify monthly listeners, which is a different set
            of people listening far less each. */}
        <p className={styles.hook} style={{ gridColumn: "1 / -1" }}>
          The same{" "}
          <span className={styles.hookFigure} ref={fansEl}>
            {count(fans)}
          </span>{" "}
          people, listening exactly the same amount, on both platforms.
        </p>
      </div>

      {disclaimer && (
        <p className={styles.footnote}>
          Your share is 55% of every subscription, after tax, publishing
          royalties and card fees, divided by how much of each fan&rsquo;s
          listening you hold. The Spotify side prices the same people listening
          the same amount: an engaged fan playing around{" "}
          {SPOTIFY.engagedFanStreamsPerMonth} tracks a month at roughly £
          {SPOTIFY.perStream} a stream, with your attention share applied to
          both sides. That per-stream rate is from a real distributor
          dashboard. The play count is an assumption. Figures are projections
          based on your inputs, not a guarantee.
        </p>
      )}
    </div>
  );
}

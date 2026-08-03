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
  formatGbp as gbp,
} from "@/lib/calculator";
import {
  ATTENTION_DEFAULT,
  ATTENTION_PRESETS,
  LISTENING_DEFAULT,
  LISTENING_MAX,
  LISTENING_MIN,
  LISTENING_PRESETS,
  MODELLED_SHARE_NOTE,
  SPOTIFY,
  spotifyEquivalentStreams,
  spotifyFanEarnings,
} from "@/lib/raaydrRates";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import Glyph from "@/components/Glyph";
import styles from "./Calculator.module.css";

const count = (v: number) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(v);

// Stream counts are quoted "roughly", and the rate under them is itself a
// blended ~£0.0028 to £0.003, so six significant figures would be false
// precision. Three is as much as the input supports.
const roughCount = (v: number) => {
  if (v <= 0) return "0";
  const magnitude = Math.pow(10, Math.floor(Math.log10(v)) - 2);
  return count(Math.round(v / magnitude) * magnitude);
};

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
  const [listening, setListening] = useState(LISTENING_DEFAULT); // plays/month
  const [tier, setTier] = useState<PricingTier>(PRICING_TIER_DEFAULT);

  const fans = sliderToFans(fanPos);
  // Pounds against pounds, with the listening volume supplied by the visitor
  // rather than assumed on their behalf.
  //
  // The version of this that had to be torn out read £0.003 x 80 assumed plays
  // from a constant, so the Spotify column looked like a measured rate when it
  // was a guess, and the 15x it implied collapsed to 1.2x the moment anyone
  // questioned the 80. The fix is not to hide the number, it is to hand it over:
  // `listening` is on screen with its own control, and spotifyFanEarnings takes
  // it as a required argument so it cannot be quietly defaulted again.
  //
  // Watch what the slider does. RAAYDR does not move with it — a fan is worth
  // the same whether they play you once or a thousand times — while Spotify
  // rises and falls with every notch. That contrast is the argument, and it is
  // the visitor's own assumption driving it rather than ours.
  const values = useMemo(() => {
    const raaydrM = raaydrMonthly(fans, attention / 100, tier);
    return {
      raaydrM,
      raaydrY: raaydrM * 12,
      spotifyM: spotifyFanEarnings(fans, attention, listening),
      spotifyStreams: spotifyEquivalentStreams(raaydrM),
    };
  }, [fans, attention, listening, tier]);

  const cap = milestone(values.raaydrY);

  // GSAP counter tween: numbers glide ~0.4s, painted straight to the DOM so
  // React never re-renders per frame.
  const display = useRef({ ...values });
  const spotifyMEl = useRef<HTMLSpanElement>(null);
  const spotifyStreamsEl = useRef<HTMLSpanElement>(null);
  const raaydrMEl = useRef<HTMLSpanElement>(null);
  const raaydrYEl = useRef<HTMLSpanElement>(null);
  const fansEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const paint = () => {
      const d = display.current;
      if (spotifyMEl.current) spotifyMEl.current.textContent = gbp(d.spotifyM);
      if (spotifyStreamsEl.current)
        spotifyStreamsEl.current.textContent = roughCount(d.spotifyStreams);
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

        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor="calc-listening">
              How much they listen, all in
            </label>
            <output htmlFor="calc-listening" className="mono-figure">
              {count(listening)} plays
            </output>
          </div>
          <div
            className={styles.tierToggle}
            role="group"
            aria-label="Monthly listening presets"
          >
            {LISTENING_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`${styles.tierSegment} ${listening === p.value ? styles.tierSegmentOn : ""}`}
                aria-pressed={listening === p.value}
                onClick={() => setListening(p.value)}
              >
                {p.label} {count(p.value)}
              </button>
            ))}
          </div>
          <input
            id="calc-listening"
            type="range"
            min={LISTENING_MIN}
            max={LISTENING_MAX}
            step={10}
            value={listening}
            aria-valuetext={`${count(listening)} plays a month`}
            onChange={(e) => setListening(Number(e.target.value))}
            className={styles.slider}
          />
          {/* This control only moves the Spotify side, and saying so is the
              point of it: on RAAYDR a fan is worth the same whether they play
              you once or a thousand times. */}
          <p className={styles.helper}>
            Total plays a month per fan, across everything they listen to, not
            just you. It changes the Spotify column and nothing else &mdash; on
            RAAYDR a fan is worth the same however much they play. Nobody
            publishes a reliable figure for this, so it is yours to set: move it
            and see what it does.
          </p>
        </div>
      </div>

      <div className={styles.results}>
        <div className={`${styles.panel} ${styles.spotify}`}>
          <p className={styles.panelName}>
            Spotify
            <span className={styles.panelSub}>
              the same people, paid per play
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

        {/* The reach line stays, because it is the one figure here that needs
            no assumption at all: earnings divided by the observed per-stream
            rate, and nothing else. */}
        <p className={styles.hook} style={{ gridColumn: "1 / -1" }}>
          The same{" "}
          <span className={styles.hookFigure} ref={fansEl}>
            {count(fans)}
          </span>{" "}
          people, either way. To earn the RAAYDR figure through Spotify instead
          you would need roughly{" "}
          <span className={styles.hookFigure} ref={spotifyStreamsEl}>
            {roughCount(values.spotifyStreams)}
          </span>{" "}
          plays a month.
        </p>
      </div>

      {disclaimer && (
        <p className={styles.footnote}>
          Your share is 55% of every subscription, after tax, publishing
          royalties and card fees, divided by how much of each fan&rsquo;s
          listening you hold. The Spotify column is that same fan&rsquo;s plays
          at roughly £{SPOTIFY.perStream} a stream, a rate taken from a real
          distributor dashboard. The rate is observed; how much anyone listens
          is not, and no reliable figure for it is published anywhere, which is
          why that one is a control rather than a number we picked. Move it and
          the Spotify column moves; the RAAYDR column does not, because a fan is
          worth the same to you however much they play. Figures are projections
          based on your inputs, not a guarantee.
        </p>
      )}
    </div>
  );
}

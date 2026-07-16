"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import {
  matchListeners,
  milestone,
  raaydrMonthly,
  sliderToFans,
  spotifyMonthly,
} from "@/lib/calculator";
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

/** ≈ figures round to a scale the eye can hold. */
const approx = (v: number) => {
  const unit = v >= 20000 ? 1000 : v >= 2000 ? 100 : 10;
  return count(Math.round(v / unit) * unit);
};

const ATTENTION_TICKS = [10, 25, 50, 75, 100];

type CalculatorProps = {
  /** Render the illustrative-estimate disclaimer inside the component. The
   *  homepage leaves this off because its RealNumbers section supplies its
   *  own footnote; standalone placements (the artist page) turn it on. */
  disclaimer?: boolean;
};

export default function Calculator({ disclaimer = false }: CalculatorProps) {
  const reduced = usePrefersReducedMotion();

  const [fanPos, setFanPos] = useState(0.5); // log position → 1,000 fans
  const [attention, setAttention] = useState(40); // percent
  const [volume, setVolume] = useState(1); // Spotify-only multiplier

  const fans = sliderToFans(fanPos);
  const values = useMemo(() => {
    const raaydrM = raaydrMonthly(fans, attention / 100);
    const spotM = spotifyMonthly(fans, attention / 100, volume);
    return {
      raaydrM,
      raaydrY: raaydrM * 12,
      spotM,
      spotY: spotM * 12,
      match: matchListeners(raaydrM),
    };
  }, [fans, attention, volume]);

  const cap = milestone(values.raaydrY);

  // GSAP counter tween: numbers glide ~0.4s, painted straight to the DOM so
  // React never re-renders per frame.
  const display = useRef({ ...values });
  const spotMEl = useRef<HTMLSpanElement>(null);
  const spotYEl = useRef<HTMLSpanElement>(null);
  const raaydrMEl = useRef<HTMLSpanElement>(null);
  const raaydrYEl = useRef<HTMLSpanElement>(null);
  const matchEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const paint = () => {
      const d = display.current;
      if (spotMEl.current) spotMEl.current.textContent = gbp(d.spotM);
      if (spotYEl.current) spotYEl.current.textContent = `${gbp(d.spotY)} a year`;
      if (raaydrMEl.current) raaydrMEl.current.textContent = gbp(d.raaydrM);
      if (raaydrYEl.current)
        raaydrYEl.current.textContent = `${gbp(d.raaydrY)} a year`;
      if (matchEl.current) matchEl.current.textContent = approx(d.match);
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
        </div>

        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor="calc-volume">How much do they stream overall</label>
            <output htmlFor="calc-volume" className="mono-figure">
              {volume.toFixed(2)}×
            </output>
          </div>
          <input
            id="calc-volume"
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.rangeEnds} aria-hidden="true">
            <span>Light</span>
            <span>Heavy</span>
          </div>
          <p className={styles.volumeCaption}>
            Play count moves Spotify. It doesn&rsquo;t move RAAYDR.
          </p>
        </div>
      </div>

      <div className={styles.results}>
        <div className={`${styles.panel} ${styles.spotify}`}>
          <p className={styles.panelName}>
            Spotify
            <span className={styles.panelSub}>pays for streams</span>
          </p>
          <p className={`mono-figure ${styles.figure}`}>
            <span ref={spotMEl}>{gbp(values.spotM)}</span>
            <span className={styles.per}>/month</span>
          </p>
          <p className={`mono-figure ${styles.annual}`}>
            <span ref={spotYEl}>{gbp(values.spotY)} a year</span>
          </p>
        </div>

        <div className={`${styles.panel} ${styles.raaydr}`}>
          <p className={styles.panelName}>
            RAAYDR
            <span className={styles.panelSub}>pays for attention</span>
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
          <p className={`mono-figure ${styles.match}`}>
            ≈ <span ref={matchEl}>{approx(values.match)}</span> casual monthly
            listeners needed on Spotify to match this
          </p>
        </div>
      </div>

      {disclaimer && (
        <p className={styles.footnote}>
          Illustrative estimate, not a guarantee. Founding tier, paid monthly,
          before payment processing. £3.50 is the most one founding fan can
          generate in a month, and only if they listen to nothing but you. The
          Spotify side assumes roughly £0.003 per stream, a typical blended rate
          for independent artists; the match figure assumes an average of 4
          streams per casual monthly listener.
        </p>
      )}
    </div>
  );
}

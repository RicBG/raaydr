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
  SPOTIFY_PLAYS_DEFAULT,
  SPOTIFY_PLAYS_MAX,
  SPOTIFY_PLAYS_MIN,
  SPOTIFY_PLAYS_PRESETS,
  SPOTIFY_PLAYS_PER_MONTHLY_LISTENER,
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
  const [plays, setPlays] = useState(SPOTIFY_PLAYS_DEFAULT); // plays of YOUR music, per fan
  const [tier, setTier] = useState<PricingTier>(PRICING_TIER_DEFAULT);

  const fans = sliderToFans(fanPos);
  // Two models, two inputs, and they are deliberately not the same input.
  //
  // RAAYDR takes `attention`: your share of that fan's listening. Spotify takes
  // `plays`: how many times they press play on YOUR music. Attention never
  // touches the Spotify figure, because the play count already is your share of
  // that fan, counted rather than expressed as a percentage.
  //
  // Feeding attention into both is the bug this replaces. It multiplied a fan's
  // total listening by the share — 500 x 20% — and produced 100 plays of your
  // music per fan per month, twenty-five times what Ric's own Spotify for
  // Artists data shows a real listener doing. Two innocent-looking assumptions
  // multiplied into an absurd one, and the pound figure looked authoritative
  // the whole time.
  //
  // The play count is anchored on that real data instead: 4 a month is the
  // observed average listener, and the presets are multiples of it.
  const values = useMemo(() => {
    const raaydrM = raaydrMonthly(fans, attention / 100, tier);
    return {
      raaydrM,
      raaydrY: raaydrM * 12,
      spotifyM: spotifyFanEarnings(fans, plays),
      spotifyStreams: spotifyEquivalentStreams(raaydrM),
    };
  }, [fans, attention, plays, tier]);

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
            <label htmlFor="calc-plays">
              How often each one plays you
            </label>
            <output htmlFor="calc-plays" className="mono-figure">
              {count(plays)} a month
            </output>
          </div>
          <div
            className={styles.tierToggle}
            role="group"
            aria-label="Plays per fan per month presets"
          >
            {SPOTIFY_PLAYS_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`${styles.tierSegment} ${plays === p.value ? styles.tierSegmentOn : ""}`}
                aria-pressed={plays === p.value}
                onClick={() => setPlays(p.value)}
              >
                {p.label} {count(p.value)}
              </button>
            ))}
          </div>
          <input
            id="calc-plays"
            type="range"
            min={SPOTIFY_PLAYS_MIN}
            max={SPOTIFY_PLAYS_MAX}
            step={1}
            value={plays}
            aria-valuetext={`${count(plays)} plays a month`}
            onChange={(e) => setPlays(Number(e.target.value))}
            className={styles.slider}
          />
          {/* Anchored on real Spotify for Artists data rather than an industry
              estimate, and it drives the Spotify column only. */}
          <p className={styles.helper}>
            Plays of <em>your</em> music, per fan, per month. This one sets the
            Spotify column and nothing else, because Spotify pays per play and
            does not care what share of a person you hold. On RAAYDR a fan is
            worth the same whether they play you twice or two hundred times. Real Spotify for Artists data puts an average monthly
            listener at about {SPOTIFY_PLAYS_PER_MONTHLY_LISTENER} plays a
            month; the presets are multiples of that.
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
          of your music at roughly £{SPOTIFY.perStream} a stream, a rate taken
          from a real distributor dashboard. Both sides of that are grounded:
          the rate is observed, and so is the play count. Spotify for Artists
          data puts an average monthly listener at about{" "}
          {SPOTIFY_PLAYS_PER_MONTHLY_LISTENER} plays a month, and the presets
          are multiples of it. Attention share deliberately does not touch the
          Spotify figure: the play count already is your share of that fan,
          counted rather than expressed as a percentage. Figures are projections
          based on your inputs, not a guarantee.
        </p>
      )}
    </div>
  );
}

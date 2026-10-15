"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { SAT_17_REEL, type ReelCard } from "@/lib/reels/sat-17";
import styles from "./ReelStage.module.css";

/**
 * A 1080x1920 stage that plays the Sat 17 reel in the browser.
 *
 * Every frame is a function of the clock `t`, in seconds from the start of the
 * loop. Nothing here is a CSS animation with a start time of its own, so pausing,
 * scrubbing and the eventual render all see the same picture at the same second.
 * That is the deterministic engine rule from the visual language file, and it is
 * what makes a preview worth signing off: what Ric watches is what gets rendered.
 *
 * The stage is drawn at its real dimensions and scaled by the page around it, so
 * nothing in here knows or cares about the viewport.
 */

export const STAGE_W = 1080;
export const STAGE_H = 1920;

const IN = 0.55; // entrance length, ease-out cubic
const OUT = 0.3; // exit length, ease-in cubic, quicker on purpose
const EYEBROW_LEAD = 0.18; // the eyebrow lands first

const easeOut = (p: number) => 1 - Math.pow(1 - Math.min(Math.max(p, 0), 1), 3);
const easeIn = (p: number) => Math.pow(Math.min(Math.max(p, 0), 1), 3);

/** Underdamped spring from 0 to 1: S(t, w, z) in the films. */
function spring(t: number, w: number, z: number) {
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t));
}

/**
 * Focus pull for anything that comes and goes: rise 26px out of a 10px blur on
 * the way in, leave by rising 14px into a 6px blur. Blur is tied to opacity so
 * nothing pops.
 */
function beat(t: number, at: number, until: number, reduced: boolean): CSSProperties | null {
  if (t < at || t > until + OUT) return null;
  const pIn = easeOut((t - at) / IN);
  const pOut = t > until ? easeIn((t - until) / OUT) : 0;
  const opacity = pIn * (1 - pOut);
  if (reduced) return { opacity };
  const y = (1 - pIn) * 26 - pOut * 14;
  const blur = (1 - pIn) * 10 + pOut * 6;
  return {
    opacity,
    transform: `translate3d(0, ${y.toFixed(2)}px, 0)`,
    filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
  };
}

function Card({ card, t, reduced }: { card: ReelCard; t: number; reduced: boolean }) {
  const eyebrow = beat(t, card.at, card.until, reduced);
  const line = beat(t, card.at + EYEBROW_LEAD, card.until, reduced);
  if (!eyebrow && !line) return null;
  return (
    <div className={styles.card}>
      {eyebrow && (
        <p className={styles.eyebrow} style={eyebrow}>
          <span className={styles.blip} aria-hidden="true" />
          {card.eyebrow}
        </p>
      )}
      {line && (
        <h2 className={styles.line} style={line}>
          {card.line}
        </h2>
      )}
    </div>
  );
}

/**
 * The four-bar mark, the exact geometry from /logo/raaydr-mark-v3.svg: bars 2 wide,
 * rx 1, at x 3, 8, 13 and 18 with heights 8, 16, 12 and 6 centred on y 12, filled
 * bottom violet to top cyan. Only the heights move: a 1.6s breath of 13%, each bar
 * 1.3 radians behind the last. Never the colour, never the x.
 */
const BAR_X = [3, 8, 13, 18];
const BAR_H = [8, 16, 12, 6];

function Mark({ t, size, reduced }: { t: number; size: number; reduced: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className={styles.mark}>
      <defs>
        <linearGradient id="reelMarkK" gradientUnits="userSpaceOnUse" x1="12" y1="20" x2="12" y2="4">
          <stop offset="0%" stopColor="#7C4DFF" />
          <stop offset="100%" stopColor="#3FC8D6" />
        </linearGradient>
      </defs>
      {BAR_X.map((x, k) => {
        const h = reduced ? BAR_H[k] : BAR_H[k] * (1 + 0.13 * Math.sin((t * Math.PI * 2) / 1.6 + k * 1.3));
        return <rect key={x} x={x} y={12 - h / 2} width={2} height={h} rx={1} fill="url(#reelMarkK)" />;
      })}
    </svg>
  );
}

function EndCard({ t, reduced }: { t: number; reduced: boolean }) {
  const { cta } = SAT_17_REEL;
  if (t < cta.at || t > cta.until + OUT) return null;
  const since = t - cta.at;
  const pOut = t > cta.until ? easeIn((t - cta.until) / OUT) : 0;
  const leave = 1 - pOut;

  // Mark springs in; the wordmark wipes in left to right 0.15s later; the
  // lock-up then settles upward as the line arrives.
  const markIn = reduced ? Math.min(since / 0.3, 1) : spring(since, 9, 0.75);
  const markFade = Math.min(since / 0.7, 1);
  const wipe = easeOut((since - 0.15) / 0.8);
  const rise = reduced ? 0 : easeOut((since - 0.6) / 0.7) * 90;

  const lockup: CSSProperties = {
    opacity: markFade * leave,
    transform: reduced ? undefined : `translate3d(0, ${(90 - rise).toFixed(2)}px, 0)`,
  };
  const markStyle: CSSProperties = reduced
    ? {}
    : {
        transform: `scale(${(0.7 + 0.3 * markIn).toFixed(4)})`,
        filter: `blur(${((1 - markFade) * 10).toFixed(2)}px)`,
      };
  const wordmarkStyle: CSSProperties = {
    clipPath: `inset(0 ${((1 - wipe) * 100).toFixed(2)}% 0 0)`,
  };

  const line = beat(t, cta.at + 0.6, cta.until, reduced);
  const sub = beat(t, cta.at + 1.0, cta.until, reduced);
  const url = beat(t, cta.at + 1.3, cta.until, reduced);
  const eyebrow = beat(t, cta.at + 0.45, cta.until, reduced);

  return (
    <div className={styles.end}>
      <div className={styles.lockup} style={lockup}>
        <div style={markStyle} className={styles.markBox}>
          <Mark t={t} size={118} reduced={reduced} />
        </div>
        {/* The wordmark is the file, never type. Ink version: this reel sits on canvas. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/raaydr-wordmark-blip-ink.svg"
          alt="RAAYDR"
          className={styles.wordmark}
          style={wordmarkStyle}
        />
      </div>
      {eyebrow && (
        <p className={`${styles.eyebrow} ${styles.endEyebrow}`} style={eyebrow}>
          <span className={styles.blip} aria-hidden="true" />
          {cta.eyebrow}
        </p>
      )}
      {line && (
        <h2 className={`${styles.line} ${styles.endLine}`} style={line}>
          {cta.line}
        </h2>
      )}
      {sub && (
        <p className={styles.sub} style={sub}>
          {cta.sub}
        </p>
      )}
      {url && (
        <p className={styles.url} style={url}>
          {cta.url}
        </p>
      )}
    </div>
  );
}

export type ReelStageProps = {
  /** Seconds into the loop. The page owns the clock; the stage only draws it. */
  t: number;
  /** Draw the bands Instagram's own UI covers: top 200px, bottom 250px. */
  safeZones?: boolean;
  playing: boolean;
};

export default function ReelStage({ t, safeZones = false, playing }: ReelStageProps) {
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // The loop pauses with the clock, so a paused frame is a still frame.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing, reduced]);

  const { duration } = SAT_17_REEL;
  // The whole picture breathes: a slow camera push over the loop, and the last
  // 0.4s focus out so the restart is a cut to black nobody sees.
  const push = reduced ? 1 : 1 + 0.05 * easeOut(t / duration);
  const tail = Math.max(0, (t - (duration - 0.4)) / 0.4);
  const glowDrift = reduced ? 0 : Math.sin((t * Math.PI * 2) / 11) * 80;

  const stageStyle: CSSProperties = {
    width: STAGE_W,
    height: STAGE_H,
    opacity: 1 - easeIn(tail),
    filter: tail > 0 && !reduced ? `blur(${(easeIn(tail) * 8).toFixed(2)}px)` : undefined,
  };

  return (
    <div className={styles.stage} style={stageStyle} data-reel-stage>
      <div
        className={styles.glow}
        style={{ transform: `translate3d(${glowDrift.toFixed(1)}px, ${(glowDrift * 0.4).toFixed(1)}px, 0)` }}
        aria-hidden="true"
      />
      <div
        className={styles.figure}
        style={{ transform: `scale(${push.toFixed(4)})` }}
        aria-hidden="true"
      >
        {reduced ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={`/media/${SAT_17_REEL.background}-poster.jpg`} alt="" className={styles.media} />
        ) : (
          <>
            {/* The poster as its own layer under the video, so the figure is there
                from first paint and stays there if the video never reaches canplay
                (a slow connection, or a browser without the codec). The video
                fades up over it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${SAT_17_REEL.background}-poster.jpg`}
              alt=""
              className={`${styles.media} ${styles.poster}`}
            />
            <video
              ref={videoRef}
              className={`${styles.media} ${videoReady ? styles.mediaReady : ""}`}
              preload="auto"
              muted
              loop
              playsInline
              autoPlay
              onCanPlay={() => setVideoReady(true)}
            >
              <source src={`/media/${SAT_17_REEL.background}.mp4`} type="video/mp4" />
            </video>
          </>
        )}
      </div>

      <div className={styles.copy}>
        <Card card={SAT_17_REEL.hook} t={t} reduced={reduced} />
        {SAT_17_REEL.cards.map((c) => (
          <Card key={c.eyebrow} card={c} t={t} reduced={reduced} />
        ))}
      </div>
      <EndCard t={t} reduced={reduced} />

      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      {safeZones && (
        <div className={styles.safe} aria-hidden="true">
          <div className={styles.safeTop}>
            <span>Instagram UI, top 200</span>
          </div>
          <div className={styles.safeBottom}>
            <span>Instagram UI, bottom 250</span>
          </div>
        </div>
      )}
    </div>
  );
}

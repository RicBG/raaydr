"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import ReelStage, { STAGE_H, STAGE_W } from "./ReelStage";
import { SAT_17_REEL } from "@/lib/reels/sat-17";
import styles from "./ReelPreview.module.css";

/**
 * The page around the stage: it owns the clock, scales the 1080x1920 stage to
 * whatever is on the other side of the glass (a 390 phone or a 1440 desktop,
 * the same way), and gives Ric replay, pause, a scrubber and the safe-zone bands.
 *
 * Ric reviews on a phone. The stage takes the full width there, with the
 * controls under it; on a desktop it sits in the middle at its 9:16 shape with
 * the notes beside it, so neither screen is a narrow column with nothing
 * designed for the rest of the page.
 */

const { duration } = SAT_17_REEL;

/**
 * Whether the site's opening curtain has left. lib/boot.ts marks <html> with
 * `data-booting` while it is up and removes the attribute when it has gone, so
 * the attribute is the external system and a MutationObserver is the
 * subscription. On the server, and before hydration, the answer is "up".
 */
function subscribeCurtain(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-booting"] });
  return () => mo.disconnect();
}
const curtainIsUp = () => !document.documentElement.hasAttribute("data-booting");
const useCurtainUp = () => useSyncExternalStore(subscribeCurtain, curtainIsUp, () => false);

function fmt(t: number) {
  const s = Math.floor(t);
  const tenths = Math.floor((t - s) * 10);
  return `${String(s).padStart(2, "0")}.${tenths}s`;
}

export default function ReelPreview() {
  const [t, setT] = useState(0);
  const [wantPlaying, setWantPlaying] = useState(true);
  // Held until the site's own opening curtain (lib/boot.ts) has gone, otherwise
  // the hook plays to a closed curtain on the first load of a session and the
  // reviewer meets card two.
  const curtainUp = useCurtainUp();
  const playing = wantPlaying && curtainUp;
  const [safeZones, setSafeZones] = useState(false);
  const [scale, setScale] = useState(0.2);

  // The clock: wall time minus an origin, wrapped to the loop. Pausing moves
  // the origin so the picture holds; scrubbing moves it the other way.
  const originRef = useRef<number | null>(null);
  const tRef = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (now: number) => {
      if (originRef.current === null) originRef.current = now - tRef.current * 1000;
      const next = ((now - originRef.current) / 1000) % duration;
      tRef.current = next;
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      originRef.current = null;
    };
  }, [playing]);

  const seek = useCallback((to: number) => {
    const clamped = Math.min(Math.max(to, 0), duration - 0.01);
    tRef.current = clamped;
    originRef.current = null;
    setT(clamped);
  }, []);

  const replay = useCallback(() => {
    seek(0);
    setWantPlaying(true);
  }, [seek]);

  // Fit the stage to its frame. Measured, not computed from the viewport, so
  // the same code fits a phone, a desktop column and a half-width window.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <main className={styles.page} data-reel-preview>
      <div className={styles.frame} ref={frameRef}>
        <div
          className={styles.scaled}
          style={{ width: STAGE_W * scale, height: STAGE_H * scale }}
          onClick={() => setWantPlaying((p) => !p)}
          role="button"
          tabIndex={0}
          aria-label={playing ? "Pause the reel" : "Play the reel"}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setWantPlaying((p) => !p);
            }
          }}
        >
          <div className={styles.inner} style={{ transform: `scale(${scale})` }}>
            <ReelStage t={t} playing={playing} safeZones={safeZones} />
          </div>
        </div>
      </div>

      <aside className={styles.panel}>
        <p className={styles.eyebrow}>Reel preview, not the render</p>
        <h1 className={styles.title}>{SAT_17_REEL.hook.line}</h1>
        <p className={styles.meta}>
          {SAT_17_REEL.day} · {SAT_17_REEL.slot} · {SAT_17_REEL.account} · format {SAT_17_REEL.format}
        </p>

        <div className={styles.controls}>
          <button type="button" className={styles.btn} onClick={() => setWantPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className={styles.btn} onClick={replay}>
            Replay
          </button>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={safeZones}
              onChange={(e) => setSafeZones(e.target.checked)}
            />
            Show where Instagram covers
          </label>
        </div>

        <label className={styles.scrub}>
          <span className={styles.time}>
            {fmt(t)} / {fmt(duration)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.05}
            value={t}
            onChange={(e) => {
              setWantPlaying(false);
              seek(Number(e.target.value));
            }}
            aria-label="Scrub through the reel"
          />
        </label>

        <dl className={styles.notes}>
          <dt>Sound</dt>
          <dd>
            None in the file, on purpose. The track, {SAT_17_REEL.track.title} by {SAT_17_REEL.track.artist}, is
            attached from Instagram&apos;s catalogue when it is scheduled, with the reel&apos;s own
            volume at zero.
          </dd>
          <dt>Caption</dt>
          <dd>{SAT_17_REEL.caption}</dd>
          <dt>Pinned comment</dt>
          <dd>{SAT_17_REEL.pinnedComment}</dd>
          <dt>The DM sends</dt>
          <dd>raaydr.com{SAT_17_REEL.dmLink}</dd>
          <dt>Background</dt>
          <dd>The artists&apos; halo loop from the site, nothing else. Tap the reel to pause it.</dd>
        </dl>
      </aside>
    </main>
  );
}

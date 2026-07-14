"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./HaloVideo.module.css";

type HaloVideoProps = {
  /** Media stem: /media/halo-{name}.mp4 + /media/halo-{name}-poster.jpg */
  name?: string;
  /** Explicit overrides, for clips that don't follow the halo-{name} stem. */
  src?: string;
  poster?: string;
  className?: string;
};

/**
 * The living halo: an audience's halo film, autoplaying muted/looping/inline,
 * object-fit cover in the hero media box. Type is always overlaid in HTML,
 * never baked in. Under reduced motion we render the poster still only.
 * Lazy: preload metadata, begin playback on canplay.
 */
export default function HaloVideo({
  name,
  src,
  poster: posterOverride,
  className,
}: HaloVideoProps) {
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const videoSrc = src ?? `/media/halo-${name}.mp4`;
  const poster = posterOverride ?? (name ? `/media/halo-${name}-poster.jpg` : undefined);
  const mime = videoSrc.endsWith(".webm") ? "video/webm" : "video/mp4";

  useEffect(() => {
    if (reduced) return;
    const video = videoRef.current;
    if (!video) return;
    const onCanPlay = () => {
      setReady(true);
      video.play().catch(() => {
        /* autoplay can be blocked; poster stays visible underneath */
      });
    };
    video.addEventListener("canplay", onCanPlay);
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [reduced]);

  // With a poster asset, reduced motion shows the still image. Without one
  // (no poster generated for this clip), fall back to the video element
  // itself paused on its first frame — still static, no extra asset needed.
  if (reduced && poster) {
    return (
      <div className={`${styles.frame} ${className ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" className={styles.media} />
      </div>
    );
  }

  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      <video
        ref={videoRef}
        className={`${styles.media} ${ready || reduced ? styles.ready : ""}`}
        poster={poster}
        preload={reduced ? "auto" : "metadata"}
        muted
        loop={!reduced}
        playsInline
        autoPlay={!reduced}
        aria-hidden="true"
      >
        <source src={videoSrc} type={mime} />
      </video>
    </div>
  );
}

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

  // Release the decoder and the buffered file when this hero leaves the page.
  //
  // Detaching a <video> does not free what it is holding. The element keeps its
  // source, its network buffer and its decoded frames, and the browser is under
  // no obligation to reclaim them promptly — Safari in particular does not. The
  // halo clips are 6-7MB each and there is one per audience page, so a phone
  // walking artists -> producers -> tastemakers -> listeners through the nav
  // accumulates them: instrumenting that route four pages at a time showed
  // twelve video elements created, one still attached, and none ever torn down.
  // That is the whole cost of the media on the page, held for the life of the
  // tab, on the device least able to afford it.
  //
  // Clearing `src` and calling load() is what actually abandons the buffer and
  // resets the decoder. It runs on unmount only, so a reduced-motion change
  // cannot tear down a video that is still on screen, and the element is read
  // from the ref at mount because by cleanup time it may already be detached.
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

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
      {/* The source is an attribute rather than a <source> child so the cleanup
          above can actually drop it: load() re-resolves from a child element,
          so a video with one can never be released. */}
      <video
        ref={videoRef}
        className={`${styles.media} ${ready || reduced ? styles.ready : ""}`}
        src={videoSrc}
        poster={poster}
        preload={reduced ? "auto" : "metadata"}
        muted
        loop={!reduced}
        playsInline
        autoPlay={!reduced}
        aria-hidden="true"
      />
    </div>
  );
}

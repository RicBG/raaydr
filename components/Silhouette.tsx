"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Silhouette.module.css";

type SilhouetteProps = {
  /** Image from the pool; null while the client-side deal hasn't run yet. */
  src: string | null;
  className?: string;
};

/**
 * A silhouette portrait from the pool, height-driven (~70svh desktop, ~55svh
 * mobile) and anchored to the bottom of its frame. The halo renders behind it
 * in code — never baked into the image.
 *
 * Deliberately NOT using next/image `fill`: fill lays the image out as
 * position:absolute inset:0 inside a container whose size comes from an
 * `aspect-ratio` box, and that exact combination (fill + aspect-ratio +
 * svh) renders at zero size on iOS WebKit (Chrome/Safari on iPhone), which
 * left the silhouettes invisible on mobile while the code-drawn halos still
 * showed. The intrinsic-dimension form below drives size from a plain
 * `height` with `width: auto` — the most cross-engine-robust way to size a
 * contained image — and still gets next/image's responsive optimisation.
 */
export default function Silhouette({ src, className }: SilhouetteProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      {showImage ? (
        <Image
          src={src}
          alt=""
          width={1050}
          height={1400}
          sizes="(max-width: 767px) 70vh, 70vh"
          className={styles.image}
          style={{ height: "100%", width: "auto" }}
          onError={() => setFailed(true)}
        />
      ) : (
        <svg
          viewBox="0 0 400 520"
          className={styles.placeholder}
          aria-hidden="true"
        >
          <path
            d="M 92 520
               C 88 430, 96 372, 118 330
               C 96 300, 84 262, 92 218
               C 100 150, 152 108, 210 106
               C 258 104, 296 132, 308 176
               C 314 196, 312 210, 306 220
               C 318 232, 326 244, 324 252
               C 322 258, 314 262, 306 262
               C 312 272, 312 280, 306 284
               C 312 290, 312 300, 304 306
               C 308 318, 302 330, 288 336
               C 276 352, 258 362, 240 366
               C 246 396, 262 420, 292 438
               C 330 462, 366 486, 378 520
               Z"
            fill="currentColor"
          />
        </svg>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import styles from "./Silhouette.module.css";

type SilhouetteProps = {
  /** Image from the pool; null while the client-side deal hasn't run yet. */
  src: string | null;
  className?: string;
};

/**
 * A silhouette portrait from the pool, height-driven (~70vh desktop, ~55vh
 * mobile) and anchored to the bottom of its frame. The halo renders behind
 * it in code — never baked into the image. Lazy by default (`preload` off).
 */
export default function Silhouette({ src, className }: SilhouetteProps) {
  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 767px) 62vw, 34vw"
          className={styles.image}
        />
      )}
    </div>
  );
}

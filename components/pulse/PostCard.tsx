import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { formatDate, type PostMeta } from "@/lib/pulse";
import styles from "./PostCard.module.css";

export default function PostCard({
  post,
  feature = false,
}: {
  post: PostMeta;
  feature?: boolean;
}) {
  return (
    <Link
      href={`/pulse/${post.slug}`}
      className={`${styles.card} ${feature ? styles.feature : ""} ${
        post.heroImage ? styles.hasMedia : ""
      }`}
      style={{ "--accent": `var(--${post.accent})` } as CSSProperties}
    >
      {/* Decorative here: the card title carries the meaning. */}
      {post.heroImage && (
        <span className={styles.media}>
          <Image
            src={post.heroImage}
            alt=""
            width={2048}
            height={1152}
            loading="lazy"
            sizes={
              feature
                ? "(max-width: 767px) 100vw, 1180px"
                : "(max-width: 767px) 100vw, 580px"
            }
            className={styles.mediaImage}
          />
        </span>
      )}

      <span className={styles.meta}>
        <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
        <span className={styles.dot} aria-hidden="true" />
        {post.readingTime}
      </span>
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.desc}>{post.description}</p>
      <span className={styles.more} aria-hidden="true">
        Read
      </span>
    </Link>
  );
}

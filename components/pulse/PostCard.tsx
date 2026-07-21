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
      className={`${styles.card} ${feature ? styles.feature : ""}`}
      style={{ "--accent": `var(--${post.accent})` } as CSSProperties}
    >
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

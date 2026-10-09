import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found: RAAYDR",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className="container">
          <p className="eyebrow">404</p>
          <h1 className={`display-section ${styles.title}`}>
            This page doesn&rsquo;t exist
          </h1>
          <p className={styles.lead}>
            The link is broken, or the page has moved. Everything else on
            raaydr.com is exactly where you left it.
          </p>
          <div className={styles.action}>
            <Link href="/" className="btn">
              Back to raaydr.com
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

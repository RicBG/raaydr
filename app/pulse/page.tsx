import type { Metadata } from "next";
import { getAllPosts } from "@/lib/pulse";
import PostCard from "@/components/pulse/PostCard";
import JsonLd from "@/components/pulse/JsonLd";
import styles from "./pulse.module.css";

const SITE = "https://raaydr.com";
const INDEX_DESCRIPTION =
  "The RAAYDR blog. Numbers, models and honest answers about the music economy, streaming royalties and attention-based payment.";

export const metadata: Metadata = {
  title: "The Pulse · The RAAYDR Blog",
  description: INDEX_DESCRIPTION,
  alternates: { canonical: "/pulse" },
  openGraph: {
    title: "The Pulse · The RAAYDR Blog",
    description: INDEX_DESCRIPTION,
    url: `${SITE}/pulse`,
    siteName: "RAAYDR",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RAAYDR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pulse · The RAAYDR Blog",
    description: INDEX_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function PulseIndex() {
  const posts = getAllPosts();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The Pulse",
    description: INDEX_DESCRIPTION,
    url: `${SITE}/pulse`,
    publisher: {
      "@type": "Organization",
      name: "RAAYDR",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/logo/raaydr-wordmark-ink.svg`,
      },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${SITE}/pulse/${post.slug}`,
      datePublished: post.datePublished,
      dateModified: post.dateUpdated,
      author: { "@type": "Person", name: "Ric" },
    })),
  };

  return (
    <main className={styles.page}>
      <JsonLd data={blogSchema} />

      <header className={`container ${styles.header}`}>
        <p className="eyebrow">The RAAYDR Blog</p>
        <h1 className={`display-section ${styles.title}`}>The Pulse</h1>
        <p className={styles.strap}>
          Numbers, models and honest answers about the music economy.
        </p>
      </header>

      <div className={`container ${styles.grid}`}>
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} feature={i === 0} />
        ))}
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getAllPosts, getAllSlugs, getPost } from "@/lib/pulse";
import PostBody from "@/components/pulse/PostBody";
import Faq from "@/components/pulse/Faq";
import PulseCta from "@/components/pulse/PulseCta";
import PostCard from "@/components/pulse/PostCard";
import JsonLd from "@/components/pulse/JsonLd";
import article from "@/components/pulse/Article.module.css";
import styles from "./post.module.css";

const SITE = "https://raaydr.com";

// Only the six known posts are generated; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `${SITE}/pulse/${post.slug}`;
  const title = `${post.title} · The Pulse · RAAYDR`;

  return {
    title,
    description: post.description,
    alternates: { canonical: `/pulse/${post.slug}` },
    openGraph: {
      title,
      description: post.description,
      url,
      siteName: "RAAYDR",
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateUpdated,
      authors: [post.author],
      images: [{ url: post.heroImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description,
      images: [post.heroImage],
    },
  };
}

export default async function PulsePost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE}/pulse/${post.slug}`;
  const more = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateUpdated,
    author: {
      "@type": "Person",
      name: "Ric",
      worksFor: { "@type": "Organization", name: "RAAYDR" },
    },
    publisher: {
      "@type": "Organization",
      name: "RAAYDR",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/logo/raaydr-wordmark-ink.svg`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${SITE}${post.heroImage}`,
    url,
  };

  const faqPage = post.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  return (
    <main className={styles.page}>
      <JsonLd data={blogPosting} />
      {faqPage && <JsonLd data={faqPage} />}

      <article className={styles.article}>
        <header className={styles.head}>
          <Link href="/pulse" className={`eyebrow ${styles.eyebrowLink}`}>
            The Pulse
          </Link>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.byline}>
            <span>{post.author}</span>
            <span className={styles.sep} aria-hidden="true" />
            <span>
              Published{" "}
              <time dateTime={post.datePublished}>
                {formatDate(post.datePublished)}
              </time>
            </span>
            <span className={styles.sep} aria-hidden="true" />
            <span>
              Updated{" "}
              <time dateTime={post.dateUpdated}>
                {formatDate(post.dateUpdated)}
              </time>
            </span>
            <span className={styles.sep} aria-hidden="true" />
            <span>{post.readingTime}</span>
          </div>
        </header>

        {/* LCP element on post pages: eager and prioritised, never lazy.
            Intrinsic dimensions (not `fill`) reserve the 16:9 box, so there
            is no layout shift and no iOS sizing bug (see Silhouette.tsx). */}
        {post.heroImage && (
          <Image
            src={post.heroImage}
            alt={post.heroAlt}
            width={2048}
            height={1152}
            priority
            sizes="(max-width: 900px) 100vw, 760px"
            className={styles.hero}
          />
        )}

        <div className={styles.body}>
          <PostBody blocks={post.blocks} />
          <Faq items={post.faq} />
          {post.note && <p className={article.note}>{post.note}</p>}
          <PulseCta slug={post.slug} />
        </div>
      </article>

      {more.length > 0 && (
        <section className={`container ${styles.more}`} aria-labelledby="more-heading">
          <h2 id="more-heading" className={styles.moreHeading}>
            More from The Pulse
          </h2>
          <div className={styles.moreGrid}>
            {more.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

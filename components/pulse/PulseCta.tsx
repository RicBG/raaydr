import Link from "next/link";
import styles from "./PulseCta.module.css";

// End-of-post call to action. The primary action is the audience calculator
// that matches what the post is about (artist earnings, or the producer /
// songwriter split); the waitlist stays available as a secondary link. Each
// calculator page carries its own waitlist join below the tool.
type CtaKind = "artist" | "producer";

const SLUG_KIND: Record<string, CtaKind> = {
  "how-much-does-spotify-pay-per-stream": "artist",
  "how-many-streams-for-1000-a-month": "artist",
  "best-spotify-alternatives-independent-artists": "artist",
  "what-is-attention-based-streaming-payment": "artist",
  "how-producers-and-songwriters-get-paid": "producer",
  "what-is-raaydr": "artist",
};

const CTA: Record<
  CtaKind,
  { headline: string; body: string; href: string; label: string }
> = {
  artist: {
    headline: "See what your real fans are worth.",
    body: "On RAAYDR your income comes from fan count and attention, not a per-stream rate. Run your own numbers in seconds.",
    href: "/artists#calculator",
    label: "Open the artist calculator",
  },
  producer: {
    headline: "Model your split before you agree it.",
    body: "An agreed percentage on a song applies automatically to the artist's earnings. See your number before you sign anything.",
    href: "/producers-songwriters#calculator",
    label: "Open the split calculator",
  },
};

export default function PulseCta({ slug }: { slug: string }) {
  const config = CTA[SLUG_KIND[slug] ?? "artist"];

  return (
    <aside className={styles.cta} aria-label="Try the RAAYDR calculator">
      <p className="eyebrow">Do the maths</p>
      <p className={styles.headline}>{config.headline}</p>
      <p className={styles.body}>{config.body}</p>
      <div className={styles.actions}>
        <Link href={config.href} className="btn">
          {config.label}
        </Link>
        <Link href="/#join" className={styles.secondary}>
          Or join the free waitlist
        </Link>
      </div>
    </aside>
  );
}

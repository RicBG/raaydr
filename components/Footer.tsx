import Link from "next/link";
import FooterWordmark from "./FooterWordmark";
import styles from "./Footer.module.css";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/#manifesto", label: "Manifesto" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#numbers", label: "The numbers" },
      { href: "/#join", label: "Pricing" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/artists", label: "Artists" },
      { href: "/producers-songwriters", label: "Producers & Songwriters" },
      { href: "/tastemakers", label: "Tastemakers" },
      { href: "/#join", label: "Listeners" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "mailto:hello@raaydr.com", label: "Contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <FooterWordmark className={styles.wordmark} />
          <p className={styles.tagline}>
            Built for the culture. Owned by the community.
          </p>
        </div>

        <div className={styles.columns}>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow">{col.title}</p>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("mailto:") ? (
                      <a href={l.href} className="link-sweep">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="link-sweep">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p className="mono-figure">© 2026 RAAYDR · Released in waves · raaydr.com</p>
      </div>
    </footer>
  );
}

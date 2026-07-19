import Link from "next/link";
import FooterWordmark from "./FooterWordmark";
import { InstagramIcon, TikTokIcon } from "./SocialIcons";
import styles from "./Footer.module.css";

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com/raaydrmusic",
    Icon: InstagramIcon,
  },
  { label: "TikTok", href: "https://tiktok.com/@raaydrmusic", Icon: TikTokIcon },
];

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
          <div className={styles.social}>
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`RAAYDR on ${label}`}
                className={styles.socialLink}
              >
                <Icon className={styles.socialIcon} />
              </a>
            ))}
          </div>
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

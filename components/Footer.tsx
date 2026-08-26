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
      { href: "/pulse", label: "Blog" },
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
        {/*
          The three facts a UK company's website has to carry: registered name, company
          number and registered office.

          Read off the Companies House register for company 17418893 on 26 August 2026 by
          `claude-chat`, not written from memory, and the rendered page on a preview
          deployment was then checked against those figures and matched.

          Be precise about what that is: ONE reading of the register, plus a check that the
          page reproduces it faithfully. It is not two independent readings. `claude-code`,
          which wrote this file, can reach neither the register nor a preview URL from its
          environment. Anyone changing these figures should read them at the register
          again rather than trusting this file.

          The registered office is a service address, which is what a service address is
          for. It is published deliberately.
        */}
        <p className={styles.registration}>
          RAAYDR LIMITED is a company registered in England and Wales, company number
          17418893. Registered office: 66 Paul Street, London, England, EC2A 4NA.
        </p>
      </div>
    </footer>
  );
}

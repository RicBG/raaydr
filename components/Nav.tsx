"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ctaCopy } from "@/lib/siteConfig";
import { InstagramIcon, TikTokIcon } from "./SocialIcons";
import styles from "./Nav.module.css";

// The four audience routes are the primary row — these are the conversion
// paths, so they keep the pills to themselves.
const audienceLinks = [
  { href: "/for-listeners", label: "Listeners" },
  { href: "/artists", label: "Artists" },
  { href: "/producers-songwriters", label: "Producers & Songwriters" },
  { href: "/tastemakers", label: "Tastemakers" },
];

// Secondary routes, set lighter and without pills so they read as a tier below
// the audience pages rather than as peers of them.
const secondaryLinks = [
  { href: "/about", label: "About" },
  { href: "/pulse", label: "Blog" },
];

const allLinks = [...audienceLinks, ...secondaryLinks];

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com/raaydrmusic",
    Icon: InstagramIcon,
  },
  { label: "TikTok", href: "https://tiktok.com/@raaydrmusic", Icon: TikTokIcon },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const ctaHref = pathname === "/" ? "#join" : "/#join";

  // Hide on scroll down, reveal on scroll up; blurred canvas background once
  // past the hero.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > window.innerHeight * 0.85);
      const delta = y - lastY;
      if (Math.abs(delta) > 8) {
        setHidden(delta > 0 && y > 160);
        lastY = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`${styles.nav} ${scrolled ? styles.scrolled : ""} ${
        hidden && !open ? styles.hidden : ""
      } ${open ? styles.menuOpen : ""}`}
    >
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.wordmark}>
          {/* The green blip is part of the mark; never crop it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/raaydr-wordmark-blip-ink.svg"
            alt="RAAYDR"
            className={styles.wordmarkImg}
          />
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {audienceLinks.map((l) => (
            <Link key={l.href} href={l.href} className={styles.pillLink}>
              {l.label}
            </Link>
          ))}
          <span className={styles.linkDivider} aria-hidden="true" />
          {secondaryLinks.map((l) => (
            <Link key={l.href} href={l.href} className={styles.textLink}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.navSocial}>
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`RAAYDR on ${label}`}
                className={styles.navSocialLink}
              >
                <Icon className={styles.navSocialIcon} />
              </a>
            ))}
          </div>
          <a href={ctaHref} className={`btn ${styles.cta}`}>
            {ctaCopy().primary}
          </a>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className={`${styles.burger} ${open ? styles.burgerOpen : ""}`} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}
      >
        <nav aria-label="Primary, mobile">
          {allLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <a href={ctaHref} className="btn" onClick={() => setOpen(false)}>
            {ctaCopy().primary}
          </a>
          <div className={styles.mobileSocial}>
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`RAAYDR on ${label}`}
                onClick={() => setOpen(false)}
              >
                <Icon className={styles.mobileSocialIcon} />
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

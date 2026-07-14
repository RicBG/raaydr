"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import styles from "./ComparePill.module.css";

const DISMISS_KEY = "raaydr-compare-pill-dismissed";

/**
 * Floating "SPOTIFY VS RAAYDR →" pill: appears once the hero scrolls out of
 * view, hides while the calculator section is in view, and can be dismissed
 * for the rest of the session. The calculator itself never moves — this is
 * just a shortcut to it.
 */
export default function ComparePill() {
  const [pastHero, setPastHero] = useState(false);
  const [inCalculator, setInCalculator] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default hidden until checked

  useEffect(() => {
    // Deferred a frame past mount, matching the pattern used elsewhere for
    // client-only reads, so this never runs synchronously inside the effect.
    const frame = requestAnimationFrame(() => {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    });

    const hero = document.getElementById("hero");
    const numbers = document.getElementById("numbers");
    const triggers: ScrollTrigger[] = [];

    if (hero) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "bottom top",
          onEnter: () => setPastHero(true),
          onLeaveBack: () => setPastHero(false),
        })
      );
    }
    if (numbers) {
      triggers.push(
        ScrollTrigger.create({
          trigger: numbers,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => setInCalculator(true),
          onLeave: () => setInCalculator(false),
          onEnterBack: () => setInCalculator(true),
          onLeaveBack: () => setInCalculator(false),
        })
      );
    }

    return () => {
      cancelAnimationFrame(frame);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const visible = pastHero && !inCalculator && !dismissed;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className={`${styles.pill} ${visible ? styles.visible : ""}`}>
      <a href="#numbers" className={styles.link}>
        <span className={styles.blip} aria-hidden="true" />
        SPOTIFY VS RAAYDR <span aria-hidden="true">→</span>
      </a>
      <button
        type="button"
        className={styles.dismiss}
        onClick={dismiss}
        aria-label="Dismiss compare link"
      >
        ×
      </button>
    </div>
  );
}

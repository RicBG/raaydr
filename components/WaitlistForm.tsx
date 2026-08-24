"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ctaCopy } from "@/lib/siteConfig";
import { ROLE_LABEL_TO_SLUG, WAITLIST_ROLE_LABELS } from "@/lib/waitlistRoles";
import {
  ARTIST_NAME_MAX_LENGTH,
  WAITLIST_GENRES,
} from "@/lib/waitlistGenres";
import { ANALYTICS_FLUSH_MS, joinedDestination } from "@/lib/joined";
import { offerFor } from "@/lib/waitlistOffers";
import { readAttribution } from "@/lib/attribution";
import { effectiveConsent } from "@/lib/consent";
import {
  getMetaBrowserIds,
  newEventId,
  trackSignup,
  trackWaitlistStart,
} from "@/lib/analytics";
import styles from "./WaitlistForm.module.css";

// The human-readable labels shown as role pills. The API/database store the
// slug form (see lib/waitlistRoles); we map label -> slug on submit.
export const ROLES = WAITLIST_ROLE_LABELS;

type Role = (typeof ROLES)[number];
type Status = "idle" | "submitting" | "success" | "error";

type WaitlistFormProps = {
  /** hero uses the primary CTA label, closing uses the closing label. */
  variant?: "hero" | "closing";
  /** Preselect a role (e.g. the For Listeners page preselects Listener). */
  defaultRole?: Role;
  /** Analytics source persisted with the signup so captures can be told apart
   *  in the email tool (e.g. "homepage-mid"). */
  source?: string;
  /** "dark" swaps the input/selected-pill colours for a dark surface (e.g. the
   *  black MidWave block). Most of the form already tracks currentColor. */
  theme?: "light" | "dark";
  /** Show the one-line offer under the role selector, changing with the role.
   *  On for the two homepage captures; off elsewhere, because the role pages
   *  already state their own offer in the page copy above the form. */
  showOffer?: boolean;
};

export default function WaitlistForm({
  variant = "hero",
  defaultRole,
  source,
  theme = "light",
  showOffer = false,
}: WaitlistFormProps) {
  const id = useId();
  const [role, setRole] = useState<Role | null>(defaultRole ?? null);
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  const label = variant === "hero" ? ctaCopy().primary : ctaCopy().closing;
  const analyticsSource = source ?? "unknown";
  // The name and genre questions are for artists and nobody else. Asking a
  // listener what they release would be a question with no right answer.
  const isArtist = role !== null && ROLE_LABEL_TO_SLUG[role] === "artist";

  // Fire waitlist_start once, on the visitor's first interaction with the form,
  // so we can measure started-but-not-completed drop-off.
  function markStart() {
    if (started.current) return;
    started.current = true;
    trackWaitlistStart(analyticsSource);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const email = (
      form.elements.namedItem(`${id}-email`) as HTMLInputElement
    ).value.trim();

    if (!role) {
      setStatus("error");
      setMessage("Pick the role that fits you. It shapes what we send you.");
      return;
    }

    const slug = ROLE_LABEL_TO_SLUG[role];
    // Artists have to say what they are called. Genre stays optional.
    const name = artistName.trim();
    if (slug === "artist" && !name) {
      setStatus("error");
      setMessage("Tell us what you release under.");
      return;
    }
    // Shared id + Meta cookies let the server-side Conversions API "Lead" event
    // dedupe against, and match better than, the browser Pixel event.
    const eventId = newEventId();
    // Advertising consent decides what leaves the browser for Meta. Without it
    // the _fbp/_fbc cookies should not exist at all (the Pixel is revoked
    // before init), but they are withheld explicitly rather than relied on to
    // be absent — a stale cookie from before the banner shipped would
    // otherwise still be forwarded.
    const consent = effectiveConsent();
    const { fbp, fbc } =
      consent === "granted" ? getMetaBrowserIds() : { fbp: "", fbc: "" };
    // Whatever brought this session here. Empty object if unavailable: this
    // must never be able to block a conversion.
    const attribution = readAttribution();

    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: slug,
          // Only ever sent for artists, so the columns stay null for everyone
          // else rather than carrying a stale answer from a switched role.
          ...(slug === "artist" && name ? { artist_name: name } : {}),
          ...(slug === "artist" && genre ? { genre } : {}),
          ...(source ? { source } : {}),
          eventId,
          consent,
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
          ...attribution,
        }),
      });
      if (!res.ok) {
        throw new Error("request-failed");
      }
      setStatus("success");
      setMessage("Taking you to your page\u2026");
      // Conversion — fires to GA4 (sign_up) and Meta Pixel (Lead) together.
      // This must happen BEFORE the document is replaced below.
      trackSignup({
        role: slug,
        source: analyticsSource,
        eventId,
        utmSource: attribution.utm_source,
        utmCampaign: attribution.utm_campaign,
      });
      // Hand off to the role page, which shows the confirmation as a modal on
      // arrival. location.replace, not assign: the form must not be left in
      // history, or Back lands a signed-up visitor back on it to resubmit.
      // The short hold lets the GA4 and Pixel beacons leave first.
      window.setTimeout(() => {
        window.location.replace(joinedDestination(slug));
      }, ANALYTICS_FLUSH_MS);
    } catch {
      // No technical detail shown — just a plain, retryable error.
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>You&rsquo;re in.</p>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form
      className={`${styles.form} ${theme === "dark" ? styles.dark : ""}`}
      onSubmit={onSubmit}
      onFocusCapture={markStart}
      noValidate
    >
      <div className={styles.row}>
        <div className={styles.emailField}>
          <label htmlFor={`${id}-email`} className={styles.fieldLabel}>
            Email
          </label>
          <input
            id={`${id}-email`}
            name={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={styles.email}
          />
        </div>
        <button type="submit" className="btn" disabled={status === "submitting"}>
          {status === "submitting" ? "Joining…" : label}
        </button>
      </div>

      <fieldset className={styles.roles}>
        <legend className={styles.fieldLabel} style={{ fontWeight: 700 }}>
          I&rsquo;m joining as
        </legend>
        <div
          className={styles.segments}
          role="radiogroup"
          aria-required="true"
          aria-label="I'm joining as"
        >
          {ROLES.map((r) => (
            <label
              key={r}
              className={`${styles.segment} ${role === r ? styles.segmentOn : ""}`}
            >
              <input
                type="radio"
                name={`${id}-role`}
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                required
                className="sr-only"
              />
              {r}
            </label>
          ))}
        </div>
      </fieldset>

      {isArtist && (
        <div className={styles.artistFields}>
          <div className={styles.field}>
            <label htmlFor={`${id}-artist-name`} className={styles.fieldLabel}>
              Artist name / band name
            </label>
            <input
              id={`${id}-artist-name`}
              name={`${id}-artist-name`}
              type="text"
              required
              maxLength={ARTIST_NAME_MAX_LENGTH}
              autoComplete="off"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className={styles.email}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-genre`} className={styles.fieldLabel}>
              Genre
            </label>
            <select
              id={`${id}-genre`}
              name={`${id}-genre`}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={styles.select}
            >
              <option value="">Pick your genre</option>
              {WAITLIST_GENRES.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {showOffer && (
        <p className={styles.offer} aria-live="polite">
          {offerFor(role)}
        </p>
      )}

      {status === "error" && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}
    </form>
  );
}

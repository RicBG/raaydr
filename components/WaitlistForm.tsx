"use client";

import { useId, useState, type FormEvent } from "react";
import { ctaCopy } from "@/lib/siteConfig";
import { ROLE_LABEL_TO_SLUG, WAITLIST_ROLE_LABELS } from "@/lib/waitlistRoles";
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
};

export default function WaitlistForm({
  variant = "hero",
  defaultRole,
  source,
}: WaitlistFormProps) {
  const id = useId();
  const [role, setRole] = useState<Role | null>(defaultRole ?? null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const label = variant === "hero" ? ctaCopy().primary : ctaCopy().closing;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const email = (
      form.elements.namedItem(`${id}-email`) as HTMLInputElement
    ).value.trim();

    if (!role) {
      setStatus("error");
      setMessage("Pick the role that fits you — it shapes what we send you.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: ROLE_LABEL_TO_SLUG[role],
          ...(source ? { source } : {}),
        }),
      });
      if (!res.ok) {
        throw new Error("request-failed");
      }
      setStatus("success");
      setMessage("We'll email you when founding spots open.");
    } catch {
      // No technical detail shown — just a plain, retryable error.
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>On the list.</p>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
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
        <legend className={styles.fieldLabel}>I&rsquo;m joining as</legend>
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

      {status === "error" && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}
    </form>
  );
}

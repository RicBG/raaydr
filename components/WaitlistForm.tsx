"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ctaCopy } from "@/lib/siteConfig";
import { ROLE_LABEL_TO_SLUG, WAITLIST_ROLE_LABELS } from "@/lib/waitlistRoles";
import {
  ARTIST_NAME_MAX_LENGTH,
  WAITLIST_GENRES,
} from "@/lib/waitlistGenres";
import { ANALYTICS_FLUSH_MS, joinedDestination } from "@/lib/joined";
import { offerFor } from "@/lib/waitlistOffers";
import { readAttribution } from "@/lib/attribution";
import {
  applicationsConfigured,
  submitArtistApplication,
} from "@/lib/artistApplication";
import { looksAutomated } from "@/lib/botCheck";
import { looksLikeEmail } from "@/lib/email";
import { NAME_MAX_LENGTH } from "@/lib/waitlistName";
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

/**
 * Has anybody started a waitlist form on this page load yet?
 *
 * Module level on purpose, so every instance shares one answer. See `markStart`.
 * A full navigation reloads the module and resets it, which is what "per page load"
 * should mean; a client-side route change does not, and that is deliberate too,
 * because it is still the same visitor in the same session.
 */
let pageHasStarted = false;

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
  /*
   * WHAT THIS PERSON IS CALLED. ASKED OF EVERY ROLE SINCE 18 SEPTEMBER 2026.
   *
   * Ric, board rows 1093 and 1103: "are we not capturing name for the other
   * audiences, for listener, producer songwriter and also tastemaker? If not,
   * I think we should."
   *
   * It used to be an application-only question, which meant 17 of the 25
   * people who joined on 17 September left no name at all and Ric had a list
   * of addresses with nothing to call anyone. It is also what the four
   * acknowledgement emails signed off on rows 1098 and 1099 open with, so
   * without it three of the four roles get "Hi," on a mail that reads like a
   * blast.
   *
   * Separate from `artistName`, which is what an artist RELEASES under. A
   * band answers both and the two answers are different.
   */
  const [realName, setRealName] = useState("");
  const [musicLink, setMusicLink] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const started = useRef(false);
  /*
   * When this form became interactive, for the minimum-fill-time check in
   * lib/botCheck. A ref rather than state, because nothing on the page should
   * re-render because a clock was read, and stamped in a mount effect rather
   * than during render, because reading the clock while rendering is impure
   * and eslint's react-hooks/purity rule rejects it.
   *
   * Zero until that effect runs, which reads as an implausibly LARGE elapsed
   * time rather than a small one. The failure direction matters: a submission
   * that somehow beats the effect is let through, never silently dropped.
   */
  const readyAt = useRef(0);
  useEffect(() => {
    readyAt.current = Date.now();
  }, []);

  const label = variant === "hero" ? ctaCopy().primary : ctaCopy().closing;
  const analyticsSource = source ?? "unknown";
  // The name and genre questions are for artists and nobody else. Asking a
  // listener what they release would be a question with no right answer.
  const isArtist = role !== null && ROLE_LABEL_TO_SLUG[role] === "artist";

  /*
   * APPLYING, NOT JOINING A WAITLIST.
   *
   * Ruled by Ric on 14 September 2026 and briefed on board rows 976 and 1002:
   * from 1 October the artist route is apply and approve. He reads each
   * application and presses Approve once, which mints a code bound to that
   * address and emails it.
   *
   * So the artist path asks two more questions than a waitlist does: who they
   * are, and where he can hear them. He cannot decide who gets in from an
   * email address and a genre.
   *
   * GATED ON THE DEPLOYMENT BEING ABLE TO SEND ONE. Without the platform
   * variables this is a preview build that can collect a waitlist signup and
   * nothing else, so it asks the old questions rather than asking five and
   * dropping the answers on the floor.
   */
  const applying = isArtist && applicationsConfigured();

  /*
   * The line under the confirmation title, in the beat before the page is
   * replaced. Board row 1030: an applicant is told what actually happens next,
   * which is that somebody reads it and may say no. Everybody else is being
   * taken to their page, which is all that is happening to them.
   */
  const handOffLine = applying
    ? "We listen to every one, and if it\u2019s a fit you\u2019ll get an invite by email."
    : "Taking you to your page\u2026";

  // Fire waitlist_start once, on the visitor's first interaction with the form,
  // so we can measure started-but-not-completed drop-off.
  //
  // THE LATCH IS PER PAGE, NOT PER FORM, and that changed when a second copy of
  // this form went onto /artists above the calculator (board row 1075). It used
  // to be a ref, which is per instance: a visitor who touched the upper form,
  // scrolled on and touched the lower one would have reported TWO starts, and
  // started-but-not-completed would have counted one person as two. The metric
  // exists to measure people, so it latches on the page.
  //
  // It carries the source of the form they touched FIRST, which is the honest
  // answer to "where did they engage". Which form they SUBMIT is a separate
  // event and keeps its own source, and that is the one that answers Ric's
  // question about which position converts.
  function markStart() {
    if (started.current || pageHasStarted) return;
    started.current = true;
    pageHasStarted = true;
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

    /*
     * THE NAME IS REQUIRED ON EVERY PATH, and it is checked FIRST because it
     * is the first field on the form. The checks below it run in the order the
     * questions are asked, so somebody filling it in top to bottom is told
     * about the first thing they missed rather than the last.
     *
     * The form carries `noValidate`, so `required` on the input is semantics
     * for assistive technology and nothing else — this is the enforcement.
     * That is the trap row 1023 recorded: an input that says `required` and a
     * form that says `noValidate` looks guarded and is not, which is how a
     * blank email reached the RPC and was dropped in silence.
     */
    const person = realName.trim();
    if (!person) {
      setStatus("error");
      setMessage(
        applying
          ? "Tell us your name, so we know who we are replying to."
          : "Tell us your name, so we know what to call you.",
      );
      return;
    }

    // Artists have to say what they RELEASE under as well, on both paths.
    const name = artistName.trim();
    if (slug === "artist" && !name) {
      setStatus("error");
      setMessage("Tell us what you release under.");
      return;
    }

    /*
     * ALL FIVE ANSWERS ARE REQUIRED ON AN APPLICATION.
     *
     * Ruled by Ric on 17 September 2026, board row 1014, in his own words:
     * "Those things have to be mandatory so I can actually do some proper
     * checks." Name, artist or band name, email, genre and a link to the
     * music. It supersedes every earlier "genre is optional" for this path.
     *
     * The database already requires all five. What it does NOT do is say so:
     * apply_to_raaydr returns silently on any missing one, deliberately, so
     * that the RPC cannot be used to find out who has already applied. So
     * every one of the five has to be refused HERE, with its own message, or
     * the person is dropped believing they applied.
     *
     * THE THREE ANSWERS AN APPLICATION REQUIRES THAT A WAITLIST DOES NOT.
     *
     * Ric is deciding whether to let this person in, and he cannot do that
     * without a name to reply to and something to listen to.
     *
     * GENRE IS THE THIRD ONE, AND IT IS REQUIRED HERE BECAUSE THE DATABASE
     * REQUIRES IT. Found by `claude-chat` on board row 1013, correcting its
     * own row 1010: `apply_to_raaydr` returns silently on a null genre, and
     * PostgREST answers 204 either way, so an artist who skipped the question
     * saw the thank-you and was never stored. A real person dropped without
     * being told is the one class of defect that stops a merge, and the fix
     * belongs in the form rather than the database: "Other" is already in
     * WAITLIST_GENRES, so requiring an answer blocks nobody.
     *
     * On the WAITLIST path genre stays optional, as it always was. Nothing
     * there is dropped for want of it.
     */
    const link = musicLink.trim();
    if (applying && !link) {
      setStatus("error");
      setMessage("Add a link to your music. It is the part we listen to.");
      return;
    }
    if (applying && !genre) {
      setStatus("error");
      setMessage("Pick the genre that fits you closest. Other is fine.");
      return;
    }
    /*
     * EMAIL, WHICH NOTHING WAS CHECKING ON THIS PATH.
     *
     * The input carries `required` and the form carries `noValidate`, so the
     * browser enforces nothing, and an application with a blank or malformed
     * address went to the RPC, was dropped silently there, and showed the
     * thank-you. Exactly the genre defect of row 1013, one field along.
     *
     * The WAITLIST path is not affected and is left alone: its own route
     * rejects a bad address and the visitor already sees a retryable error,
     * so there is nothing silent to fix there.
     *
     * The check is lib/email, which /api/waitlist now imports too, so the
     * form and the route cannot drift apart about what an address is.
     */
    if (applying && !looksLikeEmail(email)) {
      setStatus("error");
      setMessage(
        email
          ? "Check that email address. It is where the invite would go."
          : "Add your email address. It is where the invite would go.",
      );
      return;
    }

    /*
     * THE BOT CHECKS, AND THEY RUN AFTER EVERY OTHER CHECK ON PURPOSE.
     *
     * Board row 1013. A caught submission gets the ordinary thank-you and the
     * ordinary hand-off, and simply stores nothing — so it has to reach this
     * point having already passed the same validation a person passes, or the
     * difference in behaviour is itself the tell that tunes the next bot.
     *
     * No analytics either. A bot is not a Lead, and a conversion count that
     * includes them is a published number that has quietly moved.
     */
    const honeypot = (
      form.elements.namedItem(`${id}-company`) as HTMLInputElement
    ).value;
    if (looksAutomated({ honeypot, elapsedMs: Date.now() - readyAt.current })) {
      setStatus("success");
      setMessage(handOffLine);
      window.setTimeout(() => {
        window.location.replace(joinedDestination(slug, applying));
      }, ANALYTICS_FLUSH_MS);
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

    /*
     * THE APPLICATION GOES FIRST, AND IT IS THE ONE THAT CAN STOP THIS.
     *
     * Ruled on board row 1002. The two writes are not equal: the application
     * is the record Ric reads to decide who gets in, and losing one means a
     * person is waiting for an answer that will never come. The waitlist write
     * below carries advertising attribution, which matters and does not matter
     * as much as that.
     *
     * So a failure here is surfaced and the visitor presses the button again.
     * It is the only error in this form worth showing somebody.
     */
    if (applying) {
      try {
        await submitArtistApplication({
          name: person,
          artistName: name,
          email,
          musicLink: link,
          genre,
        });
      } catch {
        setStatus("error");
        setMessage("We could not send your application. Please try again.");
        return;
      }
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: slug,
          // Sent by every role, because every role is now asked. The route
          // caps it to the same ceiling this input does and the function only
          // overwrites a stored name when this one is non-empty, so a blank
          // can never take back what somebody already told us.
          name: person,
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
    } catch (waitlistError) {
      /*
       * A FAILED WAITLIST WRITE IS NOT A FAILED APPLICATION.
       *
       * For an applicant this runs AFTER `submitArtistApplication` has already
       * succeeded, so the thing that decides whether they get in is stored.
       * Showing an error here would make somebody press the button again over
       * a lost advertising event, and the second press would send a second
       * application. It would also be a lie: they have applied.
       *
       * So it is swallowed and logged. What is lost is this signup's UTM
       * attribution and its Meta Lead event, which is a real cost and is why
       * it is a console warning rather than nothing at all.
       *
       * For everyone else the waitlist write is the ONLY write, so a failure
       * there is still the plain retryable error it has always been.
       */
      if (!applying) {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
        return;
      }
      console.warn("waitlist write failed after a stored application", waitlistError);
    }

    try {
      setStatus("success");
      setMessage(handOffLine);
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
        window.location.replace(joinedDestination(slug, applying));
      }, ANALYTICS_FLUSH_MS);
    } catch {
      // Analytics or the hand-off, never the writes: both are already done by
      // here. Nothing to retry, so the visitor is told they are in rather than
      // sent round again, and the redirect is taken directly.
      setStatus("success");
      setMessage(handOffLine);
      window.location.replace(joinedDestination(slug, applying));
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        {/*
         * An artist who APPLIED is not "in", and saying so would be the one
         * lie this flow cannot tell: Ric reads every application and some are
         * refused. Board row 1030, ruled by Ric on 17 September.
         *
         * It follows `applying` rather than the role, like every other piece of
         * application language in this file. See the note on `applying` above:
         * where no application can be sent, this is an ordinary waitlist signup
         * and says so.
         */}
        <p className={styles.successTitle}>
          {applying ? "Application in." : "You\u2019re in."}
        </p>
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
      {/*
       * THE ROLE IS THE FIRST QUESTION, above the email. Ruled by Ric on board
       * row 1030. It is the answer that decides what the rest of the form even
       * asks, so asking it after the email had the visitor answer a question
       * whose context had not arrived yet.
       */}
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

      {/*
        * HONEYPOT. Invisible to people and to screen readers, never focusable
        * by keyboard, and anything in it means the submission is dropped. See
        * lib/botCheck for the ruling and for what it does and does not stop.
        *
        * Positioned off-screen rather than display:none, which the bots worth
        * catching already skip, and given a name a naive filler recognises.
        * autoComplete="off" plus a name browsers do not treat as an address
        * field keeps a password manager from filling it for a real person.
        */}
      <input
        id={`${id}-company`}
        name={`${id}-company`}
        type="text"
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        defaultValue=""
      />

      {applying && (
        <p className={styles.note}>
          We listen to every application before sending an invite.
        </p>
      )}

      {/*
       * ONE CONTAINER FOR EVERY QUESTION, AND THE EMAIL NEVER LEAVES IT.
       *
       * The order is Ric's, board row 1030: an artist answers their name, what
       * they release under, their email, their genre and where we can hear
       * them. Everybody else answers their name and their email — the name
       * added on 18 September, row 1103, and put in the same first slot so
       * the four roles read as one form asking for more of you rather than
       * four different forms.
       *
       * The email input is UNCONTROLLED — the submit handler reads it off the
       * form — so moving it between containers when the role changes would
       * throw away whatever had been typed into it. Keeping it in a fixed slot
       * of one container means React reuses the same DOM node whatever else
       * appears around it. Verified in a browser by typing an address, changing
       * role, and reading it back.
       *
       * TWO COLUMNS FROM 640px UP, FOR EVERY ROLE. It used to be artists only,
       * because every other role answered one question and a lone email field
       * in a two column grid is a half width box with nothing beside it. Now
       * that the name is asked of everybody the shortest form is two fields,
       * so the grid always has something to put in both tracks: name beside
       * email for three roles, and the five ruled questions for an artist.
       *
       * The music link spans both, because it holds the longest value on the
       * form by some way.
       */}
      <div className={`${styles.fields} ${styles.fieldsTwoUp}`}>
        <div className={styles.field}>
          <label htmlFor={`${id}-real-name`} className={styles.fieldLabel}>
            Your name
          </label>
          <input
            id={`${id}-real-name`}
            name={`${id}-real-name`}
            type="text"
            required
            maxLength={NAME_MAX_LENGTH}
            autoComplete="name"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            className={styles.email}
          />
        </div>

        {isArtist && (
          <div className={styles.field}>
            <label htmlFor={`${id}-artist-name`} className={styles.fieldLabel}>
              {/* "Artist or band name", ruled by `claude-chat` on board row 1014
                  after Ric named bands three times in one sentence: a band
                  reading "Artist name" hesitates over whether the question is
                  for them. Same field, same column, longer label — see the
                  note on .fieldsTwoUp, which this label is deliberately
                  short enough for. */}
              Artist or band name
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
        )}

        <div className={styles.field}>
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

        {isArtist && (
          <div className={styles.field}>
            <label htmlFor={`${id}-genre`} className={styles.fieldLabel}>
              Genre
            </label>
            <select
              id={`${id}-genre`}
              name={`${id}-genre`}
              /* Required on the application path only; see the genre check in
                 onSubmit. The form carries noValidate, so this is semantics
                 for assistive technology and the enforcement is there. */
              required={applying}
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
        )}

        {applying && (
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label htmlFor={`${id}-music-link`} className={styles.fieldLabel}>
              Link to your music
            </label>
            <input
              id={`${id}-music-link`}
              name={`${id}-music-link`}
              /*
               * `type="url"` is deliberately NOT used. It refuses anything
               * without a scheme, so "soundcloud.com/me" is rejected by the
               * browser with a message the person cannot act on, and that is
               * how most people write a link. Ric opens whatever arrives.
               */
              type="text"
              required
              maxLength={500}
              inputMode="url"
              autoComplete="off"
              placeholder="Spotify, SoundCloud, YouTube, anywhere we can hear you"
              value={musicLink}
              onChange={(e) => setMusicLink(e.target.value)}
              className={styles.email}
            />
          </div>
        )}
      </div>

      {showOffer && (
        <p className={styles.offer} aria-live="polite">
          {offerFor(role)}
        </p>
      )}

      {/*
       * THE BUTTON IS THE LAST THING IN THE FORM, AFTER EVERY QUESTION.
       *
       * Ric, 17 September 2026, board row 1028, having filled it in on his
       * phone: "the CTA, or the submit button, is still under where you put
       * your email, which kind of doesn't make sense... It needs to maybe go
       * after the last form field."
       *
       * Its LABEL follows the same rule as the rest of the application
       * language: somebody who is applying is told they are applying.
       */}
      <button
        type="submit"
        className={`btn ${styles.submit}`}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Joining\u2026" : applying ? "Apply to join" : label}
      </button>

      {status === "error" && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}
    </form>
  );
}

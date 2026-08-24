import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isWaitlistRoleSlug } from "@/lib/waitlistRoles";
import {
  ARTIST_NAME_MAX_LENGTH,
  isWaitlistGenreCode,
} from "@/lib/waitlistGenres";
import { sendMetaLead } from "@/lib/metaCapi";

// Uses env + the service-role Supabase client, so it must run on the Node
// runtime, never the edge.
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Waitlist signup endpoint.
 *
 * Accepts POST { email, role, source }, the attribution fields, and — from the
 * artist form only — { artist_name, genre }, and upserts into
 * `waitlist_signups` (case-insensitive on email) via the
 * `upsert_waitlist_signup` Postgres function, which runs INSERT ... ON CONFLICT
 * (lower(email)) against the table's unique lower(email) index — inserting a
 * new row or updating the role / source / updated_at of an existing one.
 *
 * All Supabase access uses the SERVICE ROLE key server-side (see
 * lib/supabaseAdmin), since the table has RLS enabled with no public policies.
 * No internal error detail is ever returned to the client.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-only, never NEXT_PUBLIC).
 */
export async function POST(request: Request) {
  let body: {
    email?: unknown;
    role?: unknown;
    source?: unknown;
    artist_name?: unknown;
    genre?: unknown;
    eventId?: unknown;
    fbp?: unknown;
    fbc?: unknown;
    consent?: unknown;
    utm_source?: unknown;
    utm_medium?: unknown;
    utm_campaign?: unknown;
    utm_content?: unknown;
    utm_term?: unknown;
    referrer?: unknown;
    landing_path?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const source =
    typeof body.source === "string" ? body.source.trim().slice(0, 64) : "";
  // Meta Conversions API fields (optional; only used for ad-conversion tracking).
  const eventId = typeof body.eventId === "string" ? body.eventId : undefined;
  const fbp = typeof body.fbp === "string" ? body.fbp : undefined;
  const fbc = typeof body.fbc === "string" ? body.fbc : undefined;

  /**
   * Advertising consent, as reported by the browser.
   *
   * Absent means no. The Conversions API runs server-side, so the banner and
   * the Pixel's own revoke cannot reach it: without this check a visitor who
   * rejected cookies would still have their hashed email sent to Meta by the
   * signup itself, which is the one leak that would make the whole banner
   * decorative. An old client that does not send the field is treated as a
   * rejection rather than trusted, because that is the safe direction to fail.
   */
  const marketingConsent = body.consent === "granted";

  // Attribution. Already sanitised client side; re-trimmed here because a
  // request body is never trusted, and length-capped to match the columns.
  const attr = (key: keyof typeof body) => {
    const value = body[key];
    return typeof value === "string" && value.trim()
      ? value.trim().slice(0, 200)
      : null;
  };
  const attribution = {
    p_utm_source: attr("utm_source"),
    p_utm_medium: attr("utm_medium"),
    p_utm_campaign: attr("utm_campaign"),
    p_utm_content: attr("utm_content"),
    p_utm_term: attr("utm_term"),
    p_referrer: attr("referrer"),
    p_landing_path: attr("landing_path"),
  };

  // What an artist calls themselves, and what they make. Only the artist form
  // sends either, and both are optional here: a missing name is worth far less
  // than a lost signup, so the server never rejects for one. Same untrusted
  // treatment as the attribution fields above — trimmed, capped to the column,
  // empty becomes null rather than an empty string.
  const artistName =
    typeof body.artist_name === "string" && body.artist_name.trim()
      ? body.artist_name.trim().slice(0, ARTIST_NAME_MAX_LENGTH)
      : null;
  const genre = typeof body.genre === "string" ? body.genre.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That doesn't look like an email address." },
      { status: 400 }
    );
  }
  if (!isWaitlistRoleSlug(role)) {
    return NextResponse.json(
      { error: "Pick the role that fits you." },
      { status: 400 }
    );
  }
  // A genre we do not recognise is refused rather than stored. The codes come
  // from a point-in-time copy of the platform's taxonomy (lib/waitlistGenres),
  // and the whole reason to store codes rather than typed text is that they
  // line up with the platform later; letting an arbitrary string through would
  // give that up for nothing. Blank stays legal — genre is optional.
  if (genre && !isWaitlistGenreCode(genre)) {
    return NextResponse.json(
      { error: "Pick a genre from the list." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    // No Supabase configured. In dev, accept and log so the forms can be
    // exercised locally; in production, tell the client it's unavailable
    // without leaking why.
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[waitlist] dev capture (no Supabase configured): ${email} · ${role}${
          source ? ` · ${source}` : ""
        }`
      );
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "The waitlist isn't taking signups right now. Try again soon." },
      { status: 503 }
    );
  }

  const core = {
    p_email: email,
    p_role: role,
    p_source: source || "unknown",
  };

  const profile = {
    p_artist_name: artistName,
    p_genre: genre || null,
  };

  let { error } = await supabase.rpc("upsert_waitlist_signup", {
    ...core,
    ...attribution,
    ...profile,
  });

  // PGRST202 is PostgREST saying no function of that name takes these named
  // arguments — i.e. a migration this code assumes has not been applied yet.
  // Step back one migration at a time rather than failing, so the signup still
  // lands. Extra fields are worth having and are never worth losing a
  // conversion over, and this removes the deploy ordering trap where shipping
  // the code before running the migration would reject every signup.
  if (error?.code === "PGRST202") {
    console.error(
      "[waitlist] artist/genre migration not applied; saved without them"
    );
    ({ error } = await supabase.rpc("upsert_waitlist_signup", {
      ...core,
      ...attribution,
    }));
  }
  if (error?.code === "PGRST202") {
    console.error(
      "[waitlist] attribution migration not applied; saved without attribution"
    );
    ({ error } = await supabase.rpc("upsert_waitlist_signup", core));
  }

  if (error) {
    // Log server-side only; never surface Supabase/Postgres detail to clients.
    console.error(`[waitlist] upsert failed: ${error.code ?? "unknown"}`);
    return NextResponse.json(
      { error: "Couldn't save your spot. Try again." },
      { status: 502 }
    );
  }

  // Server-side Meta "Lead" conversion. Deduped against the browser Pixel via
  // eventId. Awaited but never allowed to fail the signup — a CAPI error only
  // logs. No-op unless META_PIXEL_ID + META_CAPI_ACCESS_TOKEN are set.
  //
  // Skipped entirely without advertising consent. The signup itself still
  // saves: consent governs what we tell Meta, never whether someone can join.
  if (marketingConsent) {
    await sendMetaLead({
      email,
      role,
      source: source || "unknown",
      eventId,
      fbp,
      fbc,
      clientIp: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") ?? undefined,
      eventSourceUrl: request.headers.get("referer") ?? undefined,
    }).catch((err) => {
      console.error(`[waitlist] Meta CAPI failed: ${(err as Error).message}`);
    });
  }

  return NextResponse.json({ ok: true });
}

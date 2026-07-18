import { NextResponse } from "next/server";

const ROLES = ["Listener", "Artist", "Songwriter or Producer", "Tastemaker"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Stores signups in a Supabase table. Expected schema:
 *
 *   create table waitlist (
 *     id uuid primary key default gen_random_uuid(),
 *     email text not null unique,
 *     role text not null,
 *     source text,
 *     created_at timestamptz not null default now()
 *   );
 *
 * `source` tags which capture a signup came from (e.g. "homepage-mid") so the
 * captures can be told apart in the email tool. It is only sent to Supabase
 * when the client provides it, so signups from captures that don't set a
 * source are unaffected.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-only, never NEXT_PUBLIC).
 */
export async function POST(request: Request) {
  let body: { email?: string; role?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const role = body.role ?? "";
  const source =
    typeof body.source === "string" ? body.source.trim().slice(0, 64) : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That doesn't look like an email address." },
      { status: 400 }
    );
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Pick the role that fits you." },
      { status: 400 }
    );
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[waitlist] dev capture (no Supabase configured): ${email} · ${role}${source ? ` · ${source}` : ""}`
      );
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "The waitlist isn't taking signups right now. Try again soon." },
      { status: 503 }
    );
  }

  const res = await fetch(`${url}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ email, role, ...(source ? { source } : {}) }),
  });

  // Unique violation: they're already on the list. Treat as success.
  if (res.status === 409) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (!res.ok) {
    console.error(`[waitlist] Supabase insert failed: ${res.status}`);
    return NextResponse.json(
      { error: "Couldn't save your spot. Try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

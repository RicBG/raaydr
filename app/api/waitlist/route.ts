import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isWaitlistRoleSlug } from "@/lib/waitlistRoles";

// Uses env + the service-role Supabase client, so it must run on the Node
// runtime, never the edge.
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Waitlist signup endpoint.
 *
 * Accepts POST { email, role, source } and upserts into `waitlist_signups`
 * (case-insensitive on email) via the `upsert_waitlist_signup` Postgres
 * function, which runs INSERT ... ON CONFLICT (lower(email)) against the
 * table's unique lower(email) index — inserting a new row or updating the
 * role / source / updated_at of an existing one.
 *
 * All Supabase access uses the SERVICE ROLE key server-side (see
 * lib/supabaseAdmin), since the table has RLS enabled with no public policies.
 * No internal error detail is ever returned to the client.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-only, never NEXT_PUBLIC).
 */
export async function POST(request: Request) {
  let body: { email?: unknown; role?: unknown; source?: unknown };
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

  const { error } = await supabase.rpc("upsert_waitlist_signup", {
    p_email: email,
    p_role: role,
    p_source: source || "unknown",
  });

  if (error) {
    // Log server-side only; never surface Supabase/Postgres detail to clients.
    console.error(`[waitlist] upsert failed: ${error.code ?? "unknown"}`);
    return NextResponse.json(
      { error: "Couldn't save your spot. Try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

// Server-only Supabase client, initialised with the SERVICE ROLE key.
//
// The `server-only` import makes this module a build-time error if it is ever
// pulled into a Client Component or any browser bundle, so the service role
// key (which bypasses RLS and must never reach the client) cannot leak. Only
// import this from route handlers / server actions.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Returns the service-role Supabase client, or `null` when the env vars are
 * not configured (so callers can degrade gracefully rather than throw). The
 * client is created once and reused across requests.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — server-only, never
 * NEXT_PUBLIC / never exposed to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  if (!cached) {
    cached = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cached;
}

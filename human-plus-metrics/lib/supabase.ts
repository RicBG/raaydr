import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* The publishable key is safe to ship in the bundle: it is the browser key
   Supabase designs to be public, and every table is guarded by RLS (public
   select everywhere, authenticated write on weekly_notes only). Env vars
   override the baked-in values if the project ever moves. */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://oqvlfujwtimmglbggupg.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_O_XeMUIY7iV1GMwpl-nd-w_JI1OCqQK";

let browserClient: SupabaseClient | null = null;

/* Browser-side client, used only for the notes edit flow (Supabase auth
   sign-in + upsert into weekly_notes). All metric reads happen on the
   server at request time. */
export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return browserClient;
}

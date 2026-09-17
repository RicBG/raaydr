// The artist application, sent straight to the RAAYDR platform's production
// database from the visitor's own browser.
//
// ===========================================================================
// WHY THIS LEAVES THE BROWSER DIRECTLY, AND MUST NOT BE MOVED TO A ROUTE
// ===========================================================================
//
// Everything else this site writes goes through `app/api/waitlist/route.ts`
// with the service role key, which is the right shape for `waitlist_signups`
// on this project's own Supabase. This one is different and the difference is
// load bearing.
//
// `apply_to_raaydr` records the applicant's IP address, and it reads it from
// the `cf-connecting-ip` header Cloudflare sets on the request that reaches
// it. It also caps applications at twenty per address per hour, so one
// address cannot flood the queue an admin has to read.
//
// Behind a server route, EVERY application would arrive carrying this site's
// own egress address. The cap would become a count of everybody, and the
// twenty-first real applicant in any hour would be silently dropped — on the
// day paid advertising sends the most traffic this form will ever see.
//
// The platform repo says the same thing in the migration that sets the cap
// (`20260916120000_apply_and_approve.sql`), because the rule has to hold in
// both places or it holds in neither.
//
// ===========================================================================
// THE KEY IN THE BUNDLE IS THE PUBLIC ONE, ON PURPOSE
// ===========================================================================
//
// `NEXT_PUBLIC_PLATFORM_SUPABASE_ANON_KEY` is the platform's anonymous key.
// It is public by design and already ships inside app.raaydr.com's own browser
// bundle, so putting it here exposes nothing that is not already published.
//
// It is NOT the service role key and must never be. The one function it can
// reach is `apply_to_raaydr`, which is insert only, returns nothing, and reads
// no row back.
//
// Named `PLATFORM_` to keep it apart from this project's own `SUPABASE_URL`,
// which points at a different database entirely and is server-only.

export type ArtistApplication = {
  name: string;
  artistName: string;
  email: string;
  musicLink: string;
  genre: string;
};

function platformConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

/**
 * Whether this deployment can send applications at all.
 *
 * Read by the form BEFORE it asks anybody for their details, so a preview
 * build without the variables set collects a waitlist signup as it always did
 * rather than asking five questions and dropping the answers.
 */
export function applicationsConfigured(): boolean {
  return platformConfig() !== null;
}

/**
 * Send one application. Resolves when the platform accepted it.
 *
 * THROWS ON A TRANSPORT FAILURE, and the caller is expected to surface that,
 * which is the opposite of how the waitlist write is treated. An application
 * that never arrives is a person who thinks they have applied and is waiting
 * for an answer that will never come, so it is worth making them press the
 * button again. A missed advertising event is not.
 *
 * `apply_to_raaydr` returns void and answers identically whether it stored the
 * application, folded it onto an earlier one from the same address, or refused
 * it as a flood. So a 2xx here means "the platform took it", never "you are
 * in the queue" — there is deliberately no way to ask that from out here, or
 * this endpoint would be a way to test whether an address is already known.
 */
export async function submitArtistApplication(
  application: ArtistApplication,
): Promise<void> {
  const config = platformConfig();
  if (!config) throw new Error("applications-not-configured");

  const response = await fetch(`${config.url}/rest/v1/rpc/apply_to_raaydr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
    },
    body: JSON.stringify({
      p_name: application.name,
      p_artist_name: application.artistName,
      p_email: application.email,
      p_music_link: application.musicLink,
      p_genre: application.genre,
    }),
  });

  if (!response.ok) throw new Error(`application-failed-${response.status}`);
}

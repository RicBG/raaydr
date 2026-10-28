// The platform's PUBLIC Supabase endpoint, as this marketing site sees it.
//
// ===========================================================================
// WHY THIS IS ITS OWN MODULE
// ===========================================================================
//
// `lib/artistApplication.ts` had the only copy of this config read, and the
// Day One reader below needs the identical pair of variables. Two copies of
// "which URL and which key" is exactly the drift `CLAUDE.md` names: "a
// constant that mirrors a setting somewhere else will drift", and a docblock
// saying "change this too" is not a mechanism. So there is one copy, here,
// and `artistApplication` imports it.
//
// ===========================================================================
// THE KEY IN THE BUNDLE IS THE PUBLIC ONE, ON PURPOSE
// ===========================================================================
//
// `NEXT_PUBLIC_PLATFORM_SUPABASE_ANON_KEY` is the platform's anonymous key.
// It is public by design and already ships inside app.raaydr.com's own browser
// bundle, so putting it here exposes nothing that is not already published.
//
// It is NOT the service role key and must never be. Named `PLATFORM_` to keep
// it apart from this project's own `SUPABASE_URL`, which points at a
// different database entirely and is server-only.

export type PlatformConfig = { url: string; key: string };

/**
 * The platform's URL and anonymous key, or `null` when this deployment has
 * neither. Callers degrade rather than throw: a preview build without the
 * variables set has to behave like a site that cannot ask, not like a broken
 * one.
 */
export function platformConfig(): PlatformConfig | null {
  const url = process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

/**
 * Whether Day One listener places are still open, read live from the platform.
 *
 * ===========================================================================
 * IT FAILS CLOSED, AND THAT IS THE WHOLE POINT OF IT
 * ===========================================================================
 *
 * Returns `false` on anything that is not an explicit `true` from the
 * platform: an error, a timeout, a missing variable, an unparseable body, a
 * `null`. Board row 2965, ruled by `claude-chat` and approved by Ric on 2967.
 *
 * The asymmetry is deliberate and it is not defensive coding for its own
 * sake. **Showing the offer when places have gone sells somebody a place that
 * does not exist**; showing the closed wording when places remain costs us one
 * listener who reads the standard price. Those two mistakes are not the same
 * size, so the failure mode is chosen rather than inherited.
 *
 * This is also why the pages carrying it are NOT revalidated. A statically
 * cached page rendered at place 99 would go on selling place 100 for as long
 * as the cache lived, and no amount of care in this function would reach it.
 * The page stays static; this reads at view time, in the browser.
 *
 * `day_one_listener_places_remain()` is anon-executable by design and returns
 * ONE BOOLEAN rather than a count. That is the platform's choice, not a
 * limitation here: a published count is a number that can be quoted back at
 * us, and `day_one_places_left()`, which does return the number, is not
 * granted to `anon` for that reason.
 */
export async function dayOnePlacesRemain(): Promise<boolean> {
  const config = platformConfig();
  if (!config) return false;

  try {
    const response = await fetch(
      `${config.url}/rest/v1/rpc/day_one_listener_places_remain`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
        // The offer is a live fact. A cached answer is the stale page problem
        // moved one layer down.
        cache: "no-store",
      },
    );
    if (!response.ok) return false;
    return (await response.json()) === true;
  } catch {
    return false;
  }
}

import type { WaitlistRoleSlug } from "./waitlistRoles";

/**
 * Telling the platform to acknowledge a signup. Board rows 1096, 1126 and 1127.
 *
 * ===========================================================================
 * WHY THIS SITE DOES NOT SEND THE EMAIL ITSELF
 * ===========================================================================
 *
 * It writes the row and it has a Resend account within reach, so sending from
 * here would be one fewer hop. Board row 1127 ruled otherwise, on two grounds
 * that are about the second sender rather than about this call:
 *
 *   ONE COPY OF THE TEMPLATES. Ric signed off four versions line by line, and
 *   two copies of copy that specific will drift without anybody noticing,
 *   because nobody reads both inboxes.
 *
 *   ONE SENDING REPUTATION. Everything transactional leaves through the
 *   platform's Resend account and its warmed domain. A second sender would
 *   need its own, and a spam complaint on either would land on a domain that
 *   also carries invites and password resets.
 *
 * ===========================================================================
 * IT IS BEST EFFORT AND MUST NEVER FAIL A SIGNUP
 * ===========================================================================
 *
 * Ruled on 1127. If the platform is slow, down, or has not had the secret set
 * yet, the person still joined: the row is written before this runs and their
 * spot is theirs. A missed acknowledgement is a real cost, which is why every
 * failure logs rather than passing silently, but it is a smaller cost than a
 * signup that appears to have failed and is never retried.
 *
 * So this never throws, and the caller is not expected to await anything it
 * would act on.
 */

/** What the platform calls each audience. NOT what this site calls them. */
export type PlatformRole =
  | "listener"
  | "artist"
  | "producer_songwriter"
  | "tastemaker";

/**
 * THE TWO NAMES FOR ONE AUDIENCE, AND THIS MAP IS WHY THE CALL NEEDS A
 * TRANSLATION RATHER THAN A CAST.
 *
 * This site stores `songwriter_producer`. The platform's `user_roles` has only
 * ever had `producer_songwriter`. **The two words are the same two words in
 * the opposite order**, which is the kind of difference that survives every
 * review and then silently fails a runtime check, because both strings look
 * right to a person reading either file on its own.
 *
 * Neither side is wrong and neither is worth a migration to align, so the
 * translation is declared once, here, on the boundary where it happens, and
 * `signupAcknowledgement.test.ts` pins that every slug this site can store has
 * a platform role on the other side of it.
 */
export const PLATFORM_ROLE: Record<WaitlistRoleSlug, PlatformRole> = {
  listener: "listener",
  artist: "artist",
  songwriter_producer: "producer_songwriter",
  tastemaker: "tastemaker",
};

/** What the platform expects the shared secret in. Board row 1131. */
export const SECRET_HEADER = "x-raaydr-signup-secret";

function endpoint(path: string): { url: string; secret: string } | null {
  const base = process.env.PLATFORM_APP_URL?.trim();
  const secret = process.env.SIGNUP_NOTIFY_SECRET?.trim();
  if (!base || !secret) return null;
  return { url: `${base.replace(/\/+$/, "")}${path}`, secret };
}

/**
 * One POST to the platform, with the secret, that cannot throw.
 *
 * Shared by both calls below rather than written twice, because the half that
 * matters is the `catch`: a signup must survive the platform being slow, down
 * or unconfigured, and a second copy of this is the copy that one day rethrows.
 */
async function tell(
  path: string,
  what: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const config = endpoint(path);
  if (!config) {
    console.warn(
      `[${what}] PLATFORM_APP_URL or SIGNUP_NOTIFY_SECRET not set: signup saved, platform not told`,
    );
    return;
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [SECRET_HEADER]: config.secret,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      // The status and nothing else. The platform's refusal body says nothing
      // by design, and there is no detail here worth carrying into a log.
      console.error(`[${what}] platform refused: ${response.status}`);
    }
  } catch (error) {
    console.error(
      `[${what}] could not reach the platform: ${(error as Error).message}`,
    );
  }
}

/**
 * Whether this deployment can tell the platform anything at all.
 *
 * Both calls need the same two variables, so there is one answer rather than
 * one per endpoint.
 */
export function acknowledgementsConfigured(): boolean {
  return endpoint("/api/signup-acknowledgement") !== null;
}

/**
 * Ask the platform to send this person their acknowledgement.
 *
 * Resolves either way. A caller that wants to know what happened reads the
 * logs; a caller that wants to finish the signup can ignore it entirely.
 *
 * NOTHING HERE LOGS THE SECRET, and no failure message from the platform is
 * passed to the browser. A refusal on the other side is deliberately
 * uninformative, and repeating its status to a visitor would be the only way
 * anybody learned this endpoint exists.
 */
export async function requestAcknowledgement(signup: {
  email: string;
  role: WaitlistRoleSlug;
  name: string | null;
  artistName: string | null;
}): Promise<void> {
  return tell("/api/signup-acknowledgement", "acknowledgement", {
    email: signup.email,
    role: PLATFORM_ROLE[signup.role],
    name: signup.name,
    artistName: signup.artistName,
  });
}

/**
 * Tell the platform an artist has applied, so Ric hears about it.
 *
 * Board rows 1097 and 1148. He had no way of knowing an application existed
 * unless he opened the admin page, and from 1 October there is paid
 * advertising pointing at that form.
 *
 * ===========================================================================
 * ONLY WHEN AN APPLICATION WAS ACTUALLY STORED
 * ===========================================================================
 *
 * `role === "artist"` is NOT the same question. When the platform variables
 * are missing from a deployment, `applicationsConfigured()` is false and the
 * artist form collects a plain waitlist signup without ever calling
 * `apply_to_raaydr` — a preview build does exactly this. Alerting on the role
 * would tell Ric to go and read an application that is not there.
 *
 * So the browser says whether the application write succeeded, and this only
 * runs when it did. That is a claim from the client, which is worth naming:
 * the cost of a forged one is an email about an application Ric will not find,
 * and the endpoint is behind the shared secret so the forger would have to be
 * us.
 *
 * ===========================================================================
 * THE MUSIC LINK PASSES THROUGH AND IS NEVER STORED HERE
 * ===========================================================================
 *
 * Board row 1097 asks the alert to carry the five answers, and the link is the
 * one this project has no column for. It reaches the route, goes into the
 * alert, and is not written to `waitlist_signups`: the application row on the
 * platform is already the record of it, and a second copy on a second project
 * is a second thing to keep right.
 */
export async function requestApplicationAlert(application: {
  email: string;
  name: string | null;
  artistName: string | null;
  musicLink: string | null;
  genre: string | null;
}): Promise<void> {
  return tell("/api/application-alert", "application-alert", application);
}

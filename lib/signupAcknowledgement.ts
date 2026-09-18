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

function endpoint(): { url: string; secret: string } | null {
  const base = process.env.PLATFORM_APP_URL?.trim();
  const secret = process.env.SIGNUP_NOTIFY_SECRET?.trim();
  if (!base || !secret) return null;
  return {
    url: `${base.replace(/\/+$/, "")}/api/signup-acknowledgement`,
    secret,
  };
}

/** Whether this deployment can ask for acknowledgements at all. */
export function acknowledgementsConfigured(): boolean {
  return endpoint() !== null;
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
  const config = endpoint();
  if (!config) {
    console.warn(
      "[acknowledgement] PLATFORM_APP_URL or SIGNUP_NOTIFY_SECRET not set: signup saved, no email requested",
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
      body: JSON.stringify({
        email: signup.email,
        role: PLATFORM_ROLE[signup.role],
        name: signup.name,
        artistName: signup.artistName,
      }),
    });
    if (!response.ok) {
      // The status and nothing else. The platform's refusal body says nothing
      // by design, and there is no detail here worth carrying into a log.
      console.error(`[acknowledgement] platform refused: ${response.status}`);
    }
  } catch (error) {
    console.error(
      `[acknowledgement] could not reach the platform: ${(error as Error).message}`,
    );
  }
}

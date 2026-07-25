// Server-side Meta Conversions API (CAPI). Sends the waitlist "Lead" conversion
// to Meta directly from the server, so ad blockers, Safari ITP and iOS — which
// strip a big share of the browser Pixel's events — can't hide it. The event is
// deduplicated against the browser Pixel via a shared eventId.
//
// No-op unless BOTH env vars are set (server-only, never NEXT_PUBLIC):
//   META_PIXEL_ID           — same id as the browser Pixel (1071993162391254)
//   META_CAPI_ACCESS_TOKEN  — a Conversions API token from Events Manager
//                             (Settings → Conversions API → Generate access token)

import crypto from "node:crypto";

const GRAPH_VERSION = "v21.0";

/** Meta requires PII (email) SHA-256 hashed, lowercased and trimmed first. */
function hashEmail(email: string): string {
  return crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export type MetaLeadInput = {
  /** Raw email; hashed here before it ever leaves the server. */
  email: string;
  role: string;
  source: string;
  /** Shared with the browser Pixel event for deduplication. */
  eventId?: string;
  /** Meta _fbp / _fbc cookies forwarded from the client for match quality. */
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
  eventSourceUrl?: string;
};

/**
 * POSTs a "Lead" event to the Conversions API. Returns false (a no-op) when the
 * env isn't configured, true on success. Throws only on a non-OK HTTP response
 * so callers can `.catch()` and log without ever failing the signup itself.
 */
export async function sendMetaLead(input: MetaLeadInput): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return false;

  const userData: Record<string, unknown> = { em: [hashEmail(input.email)] };
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        ...(input.eventId ? { event_id: input.eventId } : {}),
        ...(input.eventSourceUrl
          ? { event_source_url: input.eventSourceUrl }
          : {}),
        user_data: userData,
        custom_data: { role: input.role, source: input.source },
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(
      token
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Meta CAPI ${res.status}: ${detail.slice(0, 300)}`);
  }
  return true;
}

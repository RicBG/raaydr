/*
 * THE TWO CHEAP BOT CHECKS ON THE CAPTURE FORM.
 *
 * Ruled by `claude-chat` on board row 1013, answering Ric's question of
 * 17 September 2026: the old artist route stopped bots because every account
 * came from Ric picking a person off the waitlist and minting a code to their
 * address. The apply-and-approve route keeps that gate exactly — nothing
 * becomes an account without him pressing Approve — but the application form
 * itself is open, so a script can fill his queue with junk and bury the real
 * artists under it. From 1 October there are paid ads pointing at that form.
 *
 * WHAT THESE TWO CHECKS ARE AND ARE NOT. They catch the common form-filling
 * bots, the ones that load a page, fill every input they find and post it.
 * They do NOT stop a script calling `apply_to_raaydr` directly: the anon key
 * is public and has to be, because the browser calling the RPC itself is what
 * lets the per-address cap see the applicant's address rather than ours.
 * Turnstile or another captcha is the answer to that one, and it needs a
 * server in front of the RPC to verify the token, so it waits until junk
 * actually shows up in the queue.
 *
 * Kept out of the component so it can be tested without a browser. The
 * component supplies the two readings; every judgement lives here.
 */

/**
 * How long the fastest plausible human takes, from the form appearing to the
 * button being pressed. Three seconds is Riz's number and it is deliberately
 * generous: a false positive here silently discards a real person's
 * application, which is the expensive failure, and no bot is slowed down by
 * having to wait longer.
 *
 * Measured from FIRST RENDER rather than from first interaction, which only
 * ever makes the elapsed time longer — the form is usually on screen well
 * before anybody touches it — and which also catches a bot that posts the
 * moment the page loads without focusing anything.
 */
export const MINIMUM_FILL_MS = 3000;

export type BotSignals = {
  /** The honeypot input's value. A person never sees this field. */
  honeypot: string;
  /** Milliseconds between the form first rendering and the button press. */
  elapsedMs: number;
};

/**
 * True where the submission should be dropped. The caller shows the ordinary
 * thank-you anyway and skips both writes: telling a bot it was caught only
 * tells whoever wrote it what to change.
 */
export function looksAutomated({ honeypot, elapsedMs }: BotSignals): boolean {
  if (honeypot.trim() !== "") return true;
  // Guard the clock going backwards (a device time change mid-form) rather
  // than reading a negative elapsed as suspiciously fast.
  if (elapsedMs < 0) return false;
  return elapsedMs < MINIMUM_FILL_MS;
}

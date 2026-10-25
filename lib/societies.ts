/**
 * The collecting societies whose logos the homepage can show, `work_items` 256.
 *
 * THE LOGOS ARE BEHIND A FLAG AND THE FLAG IS OFF IN PRODUCTION. Showing a society's
 * logo implies a relationship RAAYDR does not yet have with most of them (Riz, board row
 * 2220). Ric turns it on himself when he is ready. The writers wording without the logos is
 * fine to go live whenever he says.
 *
 * WHERE IT IS ON: `SHOW_SOCIETY_LOGOS=true` turns it on anywhere, and `=false` turns it off
 * anywhere. With neither set it follows the deployment: on in a Vercel preview, so Ric can see
 * what he is being asked to approve, and off in production and everywhere else. No Vercel
 * setting has to be changed for that default to hold.
 */

export type Society = {
  name: string;
  /** Served from `public/societies`. Single-colour ink on transparent, already trimmed. */
  src: string;
  /** Optical heights from the design, in px at desktop, so a wide mark and a tall one weigh the same. */
  rowHeight: number;
  panelHeight: number;
};

export const SOCIETIES: readonly Society[] = [
  { name: "PRS for Music", src: "/societies/prs.png", rowHeight: 48, panelHeight: 56 },
  { name: "ASCAP", src: "/societies/ascap.png", rowHeight: 50, panelHeight: 58 },
  { name: "BMI", src: "/societies/bmi.png", rowHeight: 46, panelHeight: 54 },
  { name: "SOCAN", src: "/societies/socan.png", rowHeight: 22, panelHeight: 24 },
  { name: "IMRO", src: "/societies/imro.png", rowHeight: 34, panelHeight: 38 },
  { name: "SACEM", src: "/societies/sacem.png", rowHeight: 30, panelHeight: 32 },
  { name: "SIAE", src: "/societies/siae.png", rowHeight: 40, panelHeight: 44 },
];

export function showSocietyLogos(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const explicit = env.SHOW_SOCIETY_LOGOS?.trim().toLowerCase();
  if (explicit === "true" || explicit === "1") return true;
  if (explicit === "false" || explicit === "0") return false;
  return env.VERCEL_ENV === "preview";
}

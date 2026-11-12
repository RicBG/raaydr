import type { SVGProps, ComponentType } from "react";
import { InstagramIcon, ThreadsIcon, TikTokIcon } from "@/components/SocialIcons";

/*
 * THE SOCIAL ACCOUNTS, IN ONE PLACE.
 *
 * **Ric, 11 November 21:53, board row 5348:** Threads joins the header and footer beside the
 * existing icons, and every link carries UTMs.
 *
 * **WHY THIS FILE EXISTS RATHER THAN A THIRD ENTRY IN TWO ARRAYS.** `Nav.tsx` and `Footer.tsx`
 * each held their own identical copy of the list. Adding a third account to both is the
 * "constant that mirrors a setting somewhere else will drift" fault in miniature: the next
 * account, or the next handle change, gets made in one of them and looks complete. One list,
 * two readers.
 *
 * `components/AboutContent.tsx` and `components/JoinedModal.tsx` also hardcode Instagram and
 * TikTok, and `lib/seo.ts` lists them again as `sameAs` for structured data. Those are LEFT
 * ALONE deliberately: row 5348 asks for the header and the footer, the confirmation pop-up's
 * icons are Deuce's item in row 5403, and the structured-data list is a different claim about
 * identity rather than a row of buttons. Named here so the next reader knows they exist.
 */

export type SocialAccount = {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/* The campaign the icon rows belong to, per row 5348 item 3. */
const SOCIAL_UTMS = "utm_source=raaydr_site&utm_medium=web&utm_campaign=socials";

const withUtms = (base: string) => `${base}?${SOCIAL_UTMS}`;

export const socialAccounts: SocialAccount[] = [
  {
    label: "Instagram",
    href: withUtms("https://instagram.com/raaydrmusic"),
    Icon: InstagramIcon,
  },
  /*
   * THE THREADS HANDLE IS THE INSTAGRAM ONE, which is what row 5348 item 3 rules: "For Threads
   * use the same handle as Instagram on threads.net."
   *
   * **UNCONFIRMED, AND THE ROW SAYS WHAT TO DO ABOUT IT.** A plain request to
   * threads.net/@raaydrmusic answers 200, and that proves nothing: Threads serves a shell for a
   * handle that does not exist, and reading the page body needs a browser user agent this
   * session is not permitted to send. Row 5348: "If you cannot confirm the Threads profile
   * exists, post the URL you intend to use on your row and Riz checks with Ric before merge."
   * It is posted. Do not merge this on the strength of the 200.
   */
  {
    label: "Threads",
    href: withUtms("https://www.threads.net/@raaydrmusic"),
    Icon: ThreadsIcon,
  },
  {
    label: "TikTok",
    href: withUtms("https://tiktok.com/@raaydrmusic"),
    Icon: TikTokIcon,
  },
];

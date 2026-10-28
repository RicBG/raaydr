// llms.txt, with the Day One tier line chosen by whether places remain.
//
// WHY THIS IS NOT A STATIC FILE ANY MORE. It sat in `public/` stating "the first 100 listeners
// ... £6.99" to every crawler for as long as it was cached, which is the stale-page problem the
// live Day One read exists to remove, and an AI crawler quoting it is the worst audience for a
// sentence that may have stopped being true. Board rows 2962, 2965, 2967; `work_items` 225.
//
// The template is `content/llms.txt`. The route asks the platform on the server and passes the
// answer in, FAILING CLOSED like every other surface: anything but an explicit `true` takes the
// closed wording.

import fs from "node:fs";
import path from "node:path";
import { DAY_ONE_TERMS } from "./dayOneTerms";
import { PRICING } from "./raaydrRates";

export const DAY_ONE_TIER_TOKEN = "{{dayOne.tier}}";

/** The bullet under "Subscription tiers", wrapped the way the rest of the file is. */
export function dayOneTierLines(open: boolean): string {
  if (open) {
    return [
      `- Day One: the first ${PRICING.dayOneCap} listeners. They pay ${DAY_ONE_TERMS.they}.`,
      `  Everyone after that pays the standard £${PRICING.standard}. Availability is limited and the`,
      "  current terms are published on the site.",
    ].join("\n");
  }
  return [
    `- Day One: all ${PRICING.dayOneCap} Day One places have gone. Everyone who joins now pays the`,
    `  standard £${PRICING.standard} a month. The current terms are published on the site.`,
  ].join("\n");
}

export function renderLlmsTxt(template: string, open: boolean): string {
  return template.replace(DAY_ONE_TIER_TOKEN, dayOneTierLines(open));
}

export function readLlmsTemplate(): string {
  return fs.readFileSync(path.join(process.cwd(), "content", "llms.txt"), "utf8");
}

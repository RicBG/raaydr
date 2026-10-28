import type { Metadata } from "next";
import Link from "next/link";
import ReferralCalculator from "@/components/sections/ReferralCalculator";
import FaqAccordion from "@/components/FaqAccordion";
import type { FaqItem } from "@/lib/faqData";
import { pageMetadata } from "@/lib/seo";
import {
  REFERRAL_PAID_FROM,
  SIGN_OFF_LADDER,
  listeners,
  money,
  referralFigures,
  referralRule,
} from "@/lib/referralCalculator";
import styles from "../streaming-royalty-calculator/tool.module.css";

// Work item 401. A published figure: Ric signs off the numbers before this ships, so this page and
// its image route are in a draft pull request that is not merged until he has. The rule is stated in
// one place, `lib/referralCalculator.ts`, and read here.
export const metadata: Metadata = pageMetadata({
  title: "Referral Calculator: Earn a Pound a Month per Listener | RAAYDR",
  description:
    "Refer listeners to RAAYDR and earn a pound a month for every one, for as long as they stay subscribed. There is no limit. Move the slider to see what it adds up to.",
  path: "/tools/referral-calculator",
});

const FAQ: FaqItem[] = [
  {
    question: "How much do I earn for referring a listener?",
    answer: referralRule("gbp"),
  },
  {
    question: "Is there a limit on how many listeners I can refer?",
    answer:
      "No. There is no cap on the number of listeners you can refer. The reward is paid every month for each one who is still subscribed, not once.",
  },
  {
    question: "Who pays the referral reward?",
    answer: REFERRAL_PAID_FROM,
  },
  {
    question: "Is the yearly figure a promise?",
    answer:
      "No. It is twelve times the monthly figure, which is what it comes to if every one of those listeners stays subscribed for the whole year. Nothing here predicts how many listeners anyone will refer.",
  },
];

export default function ReferralCalculatorPage() {
  return (
    <main className={styles.page}>
      <header className={`container ${styles.header}`}>
        <p className="eyebrow">Free tool</p>
        <h1 className={`display-section ${styles.title}`}>Referral calculator</h1>
        <p className={styles.lead}>
          {referralRule("gbp")} Put in how many listeners you could bring and see what it adds up to.
        </p>
        <p className={styles.links}>
          Want to see what your fans are worth through their listening instead? Try the{" "}
          <Link href="/tools/streaming-royalty-calculator">streaming royalty calculator</Link>.
        </p>
      </header>

      <section className={styles.calc} id="calculator">
        <div className="container">
          <ReferralCalculator />
        </div>
      </section>

      <section className={`container ${styles.more}`}>
        <h2 className={styles.moreHeading}>At a glance</h2>
        <table className={styles.table}>
          <caption className="visually-hidden">What referral money comes to, in pounds</caption>
          <thead>
            <tr>
              <th scope="col">Listeners you refer</th>
              <th scope="col">Each month</th>
              <th scope="col">A year, if they all stay</th>
            </tr>
          </thead>
          <tbody>
            {SIGN_OFF_LADDER.map((n) => {
              const f = referralFigures(n, "gbp");
              return (
                <tr key={n}>
                  <th scope="row">{listeners(n)}</th>
                  <td>{money(f.monthlyMinor, "gbp")}</td>
                  <td>{money(f.yearlyMinor, "gbp")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <FaqAccordion items={FAQ} />

      <section className={`container ${styles.more}`}>
        <h2 className={styles.moreHeading}>Keep reading</h2>
        <ul className={styles.moreList}>
          <li>
            <Link href="/artists">RAAYDR for artists</Link>
          </li>
          <li>
            <Link href="/pulse/where-your-9-99-actually-goes">Where your subscription actually goes</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

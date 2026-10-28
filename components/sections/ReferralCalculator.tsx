"use client";

import { useId, useMemo, useState } from "react";
import {
  FIELD_MAX,
  REFERRAL_CURRENCIES,
  REFERRAL_PAID_FROM,
  SLIDER_MAX,
  clampReferred,
  listeners,
  money,
  referralFigures,
  referralLinkLine,
  referralRule,
  rewardLabel,
  type ReferralAudience,
  type ReferralCurrency,
} from "@/lib/referralCalculator";
import styles from "./Calculator.module.css";

/**
 * What an artist's referrals are worth. `work_items` 401, Ric's go on board rows 4232 and 4233; the
 * rule and why there is no cap are in `lib/referralCalculator.ts`.
 *
 * Same visual system as the royalty calculator it sits beside ("Do the maths"), so it reuses that
 * module's classes rather than growing a second look. It has a slider for the common range and a
 * number field that is not capped at the slider's end, because "no limit on how many" is part of
 * the rule and a control that stopped at 1,000 would read as a limit.
 */
export default function ReferralCalculator({
  defaultReferred = 25,
  audience = "artist",
}: {
  defaultReferred?: number;
  /** Who is reading: the footnote says only what is true for them. See `referralLinkLine`. */
  audience?: ReferralAudience;
}) {
  const id = useId();
  const [referred, setReferred] = useState(clampReferred(defaultReferred));
  const [currency, setCurrency] = useState<ReferralCurrency>("gbp");

  const figures = useMemo(() => referralFigures(referred, currency), [referred, currency]);

  return (
    <div className={styles.calculator}>
      <div className={styles.controls}>
        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label htmlFor={`${id}-n`}>Listeners you refer</label>
            <output htmlFor={`${id}-n ${id}-slider`} className="mono-figure">
              {referred.toLocaleString("en-GB")}
            </output>
          </div>
          <input
            id={`${id}-slider`}
            type="range"
            min={0}
            max={SLIDER_MAX}
            step={1}
            value={Math.min(referred, SLIDER_MAX)}
            aria-label="Listeners you refer, slider"
            aria-valuetext={listeners(referred)}
            onChange={(e) => setReferred(clampReferred(Number(e.target.value)))}
            className={styles.slider}
          />
          <input
            id={`${id}-n`}
            type="number"
            inputMode="numeric"
            min={0}
            max={FIELD_MAX}
            step={1}
            value={referred}
            onChange={(e) => setReferred(clampReferred(Number(e.target.value)))}
            className={styles.numberField}
          />
          <p className={styles.helper}>
            The slider goes to {SLIDER_MAX.toLocaleString("en-GB")}. The box does not stop there:
            there is no limit on how many listeners you can refer.
          </p>
        </div>

        <div className={styles.control}>
          <div className={styles.controlHead}>
            <p className={styles.groupLabel} id={`${id}-cur`}>
              Where you are
            </p>
          </div>
          <div className={styles.tierToggle} role="radiogroup" aria-labelledby={`${id}-cur`}>
            {REFERRAL_CURRENCIES.map((c) => (
              <label key={c} className={`${styles.tierSegment} ${currency === c ? styles.tierSegmentOn : ""}`}>
                <input
                  type="radio"
                  name={`${id}-currency`}
                  value={c}
                  checked={currency === c}
                  onChange={() => setCurrency(c)}
                />
                {rewardLabel(c)} a month
              </label>
            ))}
          </div>
          <p className={styles.helper}>
            The same flat amount in pounds, dollars or euros, by where you are. It does not depend on
            what the listener pays.
          </p>
        </div>
      </div>

      <div className={styles.results}>
        <div className={`${styles.panel} ${styles.raaydr}`}>
          <p className={styles.panelName}>
            Referral money
            <span className={styles.panelSub}>for {listeners(figures.referred)}, while they stay subscribed</span>
          </p>
          <p className={`mono-figure ${styles.figure}`} data-testid="referral-monthly">
            <span>{money(figures.monthlyMinor, currency)}</span>
            <span className={styles.per}>/month</span>
          </p>
          <p className={`mono-figure ${styles.annual}`} data-testid="referral-yearly">
            <span>{money(figures.yearlyMinor, currency)} a year</span>
          </p>
          <p className={styles.helper}>The yearly figure is if every one of them stays subscribed for the year.</p>
        </div>

        <p className={styles.hook} style={{ gridColumn: "1 / -1" }}>
          {referralRule(currency)} {REFERRAL_PAID_FROM}
        </p>
      </div>

      <p className={styles.footnote}>
        {referralLinkLine(audience)}{" "}
        A listener counts once they join through a referral link and subscribe, and keeps counting for as long as they stay subscribed. If a listener later joins
        again through another artist&rsquo;s link they count for that artist from then on. Referral
        money starts when the first listener subscribes. These are the rules, not a forecast: nothing
        here predicts how many listeners anyone will refer.
      </p>
    </div>
  );
}

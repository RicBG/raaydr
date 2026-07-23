import type { Metadata } from "next";
import PageSpectraNoise from "@/components/PageSpectraNoise";
import styles from "../about/about.module.css";

export const metadata: Metadata = {
  title: "Terms: RAAYDR",
};

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.noiseBg}>
        {/* Not audience-specific — see About for why "listeners" is the
            neutral pick there; rotated to a different colour here so the
            legal pages aren't all identical. */}
        <PageSpectraNoise audience="tastemakers" />
      </div>

      <div className={styles.content}>
        <div className="container">
          <p className="eyebrow">Legal</p>
          <h1 className={`display-section ${styles.title}`}>Terms</h1>
          <div className={styles.body}>
            <p>
              RAAYDR is currently in waitlist mode. Full terms of service will be
              published here before Day One memberships open. Joining the
              waitlist creates no payment obligation.
            </p>
            <p>
              Questions in the meantime:{" "}
              <a href="mailto:hello@raaydr.com" className="link-sweep">
                hello@raaydr.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import PageSpectraNoise from "@/components/PageSpectraNoise";
import styles from "../about/about.module.css";

export const metadata: Metadata = {
  title: "Privacy — RAAYDR",
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.noiseBg}>
        {/* Not audience-specific — see About for why "listeners" is the
            neutral pick there; rotated to a different colour here so the
            legal pages aren't all identical. */}
        <PageSpectraNoise audience="producers" />
      </div>

      <div className={styles.content}>
        <div className="container">
          <p className="eyebrow">Legal</p>
          <h1 className={`display-section ${styles.title}`}>Privacy</h1>
          <div className={styles.body}>
            <p>
              While RAAYDR is in waitlist mode we collect exactly two things when
              you sign up: your email address and the role you choose. We use
              them to tell you when founding spots open, and for nothing else. No
              tracking pixels, no data resale, no third-party advertising.
            </p>
            <p>
              Want your details removed? One email:{" "}
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

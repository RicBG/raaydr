import type { Metadata } from "next";
import PageSpectraNoise from "@/components/PageSpectraNoise";
import { pageMetadata } from "@/lib/seo";
import styles from "../about/about.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Privacy: RAAYDR",
  path: "/privacy",
});

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
              While RAAYDR is in waitlist mode, signing up stores your email
              address, the role you choose, and how you reached us: the campaign
              tags on the link you followed, the site that referred you, and the
              page you landed on. We use your email to tell you when Day One
              spots open, and the rest to understand which of our own channels
              actually work. We never sell your data.
            </p>
            <p>
              <strong>Cookies and tracking.</strong> We use Google Analytics to
              see how the site is used and the Meta pixel to measure whether our
              ads reach the right people. Both set cookies and both are off
              until you accept them on the banner. If you reject, neither runs,
              nothing about your signup is sent to Meta, and everything on the
              site still works. You can change your mind at any time by clearing
              this site&rsquo;s data in your browser, which brings the banner
              back.
            </p>
            <p>
              We also measure page speed and rough traffic volume through
              Vercel. That one sets no cookies and cannot identify you, so it
              runs without needing your permission.
            </p>
            <p>
              Want your details removed, or a copy of what we hold? One email:{" "}
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

import type { Metadata } from "next";
import PageSpectraNoise from "@/components/PageSpectraNoise";
import { pageMetadata } from "@/lib/seo";
import styles from "../about/about.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Terms: RAAYDR",
  path: "/terms",
});

/*
 * The terms themselves, replacing the placeholder that stood here from PR #70.
 *
 * WHERE THE WORDING COMES FROM, because none of it is mine to invent: the source is
 * `raaydr-terms-interim-v1.0.md` in Drive, drafted 16 August 2026. Every clause was checked
 * against production on 28 September (ops.handoff row 1797), `claude-chat` signed the changes
 * off on row 1818, and Ric approved them on row 1819.
 *
 * THE WORD "INTERIM" APPEARS NOWHERE A READER CAN SEE IT, and that is a deliberate override.
 * The source document says "The site version must carry the interim label visibly". Ric ruled
 * the opposite on row 1819 -- the public name is "Terms", never "interim" -- and his ruling
 * wins. The lead paragraph still says plainly that a solicitor has not reviewed these and that
 * fuller terms will replace them, so the honesty the interim label was carrying is kept; only
 * the word is gone. The version string stamped at signup is still `terms-interim-2026-09-v1`,
 * which is internal and which `packages/rates/src/terms-version.test.ts` in the platform repo
 * asserts never reaches a reader.
 *
 * THE STRUCTURE IS /privacy's, not a new one: the same imports, the same `about.module.css`,
 * and clause headings as inline `<strong>` rather than `<h2>`, because that module styles no
 * headings inside `.body` and an `<h2>` would inherit whatever the global sheet does. The
 * 62ch reading measure is inherited from the sibling legal pages and is not changed here --
 * redesigning the legal pages is a separate job from publishing the wording.
 */
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
              <strong>Last updated 28 September 2026.</strong> These terms cover
              this site, the waitlist, and early artist uploads. Fuller terms,
              reviewed by a solicitor, will replace them before Day One
              memberships open. We&rsquo;re publishing these now because
              we&rsquo;ve made promises on this site, and promises should have
              contract language behind them.
            </p>
            <p>
              <strong>1. Who we are.</strong> RAAYDR is operated by RAAYDR
              LIMITED, registered in England and Wales, company number 17418893,
              registered office 66 Paul Street, London, EC2A 4NA. Contact:{" "}
              <a href="mailto:hello@raaydr.com" className="link-sweep">
                hello@raaydr.com
              </a>
              .
            </p>
            <p>
              <strong>2. The service right now.</strong> Joining the waitlist
              creates no payment obligation. Early platform access is by
              invitation and access code. Playing another artist&rsquo;s music
              needs either a listener subscription or an access grant we give you
              directly, such as an invited early access place or a tastemaker
              place. Artists can always play their own uploads. Listener
              subscriptions are not on sale yet, so for now access is by our
              grant only.
            </p>
            <p>
              <strong>3. Your music stays yours.</strong> If you upload music to
              RAAYDR, you keep full ownership of your recordings, your rights and
              your catalogue. Uploading grants RAAYDR a non exclusive,
              revocable, royalty free licence, worldwide, to host your music,
              artwork and track details, make the technical copies needed to
              deliver them, and stream and display them to anyone we give access
              to RAAYDR, whether by subscription or by a grant we make directly.
              That is the whole licence. It ends for a track when you take that
              track down. Plays that were already counted while the track was
              live stay counted, so money your fans&rsquo; listening generated
              still reaches you.
            </p>
            <p>
              <strong>4. Your music is never used to train AI.</strong> RAAYDR
              will not use your music, your artwork or your metadata to train any
              machine learning or artificial intelligence model of any kind,
              generative or otherwise. We will not license, sell or share it to
              anyone for that purpose. Ordinary processing needed to run the
              service, such as encoding files for streaming or checking playback
              events for fraud, is not model training and is all we do with it.
            </p>
            <p>
              When you upload, we ask you one question about AI: whether any part
              of the track was generated by it. Production tools like mastering
              or pitch correction do not count. Your answer is shown on the track
              as a &ldquo;Made with AI&rdquo; mark when it is yes. That is a
              disclosure to listeners, not a permission you give us.
            </p>
            <p>
              <strong>5. Uploading is free.</strong> RAAYDR does not charge
              artists to upload or host music, and paying for any optional RAAYDR
              product is never a condition of uploading, being streamed, or being
              paid.
            </p>
            <p>
              <strong>6. How the money moves.</strong> None of this is running
              yet: listener subscriptions are not on sale, no payment has been
              taken and no payout has been made. This is how it will work when it
              starts.
            </p>
            <p>
              Subscribers pay RAAYDR directly. From each subscription we deduct
              VAT, publishing royalties and payment processing fees; what remains
              is distributable revenue, shared between artists, tastemakers and
              RAAYDR at the rates published on raaydr.com. Each fan&rsquo;s
              artist money is allocated within that fan&rsquo;s own billing
              month, according to that fan&rsquo;s own counted listening. If a
              fan pays but doesn&rsquo;t press play, their money follows their
              last month of listening, and if they&rsquo;ve never listened it
              goes to the artists everyone else is listening to. RAAYDR does not
              retain unallocated artist money. Artists are paid monthly, one
              month behind, so every payout is made from money that has fully
              cleared. Your first payout lands in your second payout run. Payouts
              are made through Stripe Connect once your balance reaches £50;
              smaller balances roll forward and stay visible in your dashboard.
              If you close your account, any remaining balance is paid at the
              next run regardless of the threshold. Counting rules and rates are
              published, and changes to them are announced, never silent.
            </p>
            <p>
              If you share a track&rsquo;s credit with someone else and they
              claim it, their share is paid to them directly, and they accept
              these terms when they claim it.
            </p>
            <p>
              <strong>7. What you promise us.</strong> By uploading, you confirm
              you own or control all rights in the music, including any samples,
              and that nothing in it infringes anyone else&rsquo;s rights or
              breaks the law. If a track turns out to infringe, we can remove it,
              void its plays and recover any money it generated.
            </p>
            <p>
              <strong>8. Reversed payments.</strong> If a subscriber&rsquo;s
              payment is disputed or refunded, the earnings that payment funded
              are reversed. Amounts already paid out are deducted from future
              balances; we never invoice an artist back.
            </p>
            <p>
              <strong>9. Suspension.</strong> We can suspend accounts we
              reasonably believe are defrauding the platform or infringing
              rights. Suspension decisions that affect money are reviewed by a
              human before any payout is withheld.
            </p>
            <p>
              <strong>10. Changes and contact.</strong> We&rsquo;ll give notice
              on this page and by email before these terms change materially.
              These terms are governed by the law of England and Wales.
              Questions:{" "}
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

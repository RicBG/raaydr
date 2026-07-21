import type { FaqItem } from "@/lib/pulse";
import { renderInline } from "./inline";
import styles from "./Article.module.css";

// Styled question/answer blocks. The site has no shared FAQ accordion
// component, so per the build brief these render as static Q/A blocks. The
// same items also feed the FAQPage JSON-LD on the post page.
export default function Faq({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className={styles.faq} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className={styles.h2}>
        FAQ
      </h2>
      <dl className={styles.faqList}>
        {items.map((item, i) => (
          <div key={i} className={styles.faqItem}>
            <dt className={styles.faqQuestion}>
              {renderInline(item.question, `faqq${i}`)}
            </dt>
            <dd className={styles.faqAnswer}>
              {renderInline(item.answer.replace(/\n/g, " "), `faqa${i}`)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

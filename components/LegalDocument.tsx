import Link from "next/link";
import type { ReactNode } from "react";
import PageSpectraNoise from "@/components/PageSpectraNoise";
import type { Inline, LegalDoc } from "@/lib/legal";
import styles from "./LegalDocument.module.css";

/*
 * One layout for all four legal pages. On a phone it is a single reading
 * column. From 1024px it uses the width on purpose: a sticky contents list on
 * the left (every section, one tap away) and the text on the right at a
 * reading measure, so a long document is never a narrow strip with empty space
 * beside it.
 */

const OTHER_PAGES = [
  { href: "/terms", label: "Terms of service" },
  { href: "/website-terms", label: "Website terms" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/cookies", label: "Cookie policy" },
];

function plain(nodes: Inline[]): string {
  return nodes
    .map((n) => (n.kind === "text" ? n.text : plain(n.children)))
    .join("");
}

function renderInline(nodes: Inline[], keyPrefix = ""): ReactNode[] {
  return nodes.map((n, i) => {
    const key = `${keyPrefix}${i}`;
    switch (n.kind) {
      case "text":
        return n.text;
      case "bold":
        return <strong key={key}>{renderInline(n.children, `${key}-`)}</strong>;
      case "italic":
        return <em key={key}>{renderInline(n.children, `${key}-`)}</em>;
      case "link": {
        const internal = n.href.startsWith("/");
        return internal ? (
          <Link key={key} href={n.href} className="link-sweep">
            {renderInline(n.children, `${key}-`)}
          </Link>
        ) : (
          <a
            key={key}
            href={n.href}
            className="link-sweep"
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderInline(n.children, `${key}-`)}
          </a>
        );
      }
    }
  });
}

export default function LegalDocument({
  doc,
  current,
  audience = "producers",
}: {
  doc: LegalDoc;
  current: string;
  audience?: "artists" | "listeners" | "producers" | "tastemakers";
}) {
  return (
    <main className={styles.page}>
      <div className={styles.noiseBg}>
        <PageSpectraNoise audience={audience} />
      </div>

      <div className={`container ${styles.content}`}>
        <p className="eyebrow">Legal</p>
        <h1 className={`display-section ${styles.title}`}>{doc.title}</h1>

        <div className={styles.layout}>
          <aside className={styles.aside} aria-label="On this page">
            {doc.sections.length > 1 && (
              <nav className={styles.toc}>
                <p className={styles.asideLabel}>On this page</p>
                <ol>
                  {doc.sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`}>{s.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <nav className={styles.others} aria-label="Legal pages">
              <p className={styles.asideLabel}>Legal</p>
              <ul>
                {OTHER_PAGES.map((p) => (
                  <li key={p.href}>
                    {p.href === current ? (
                      <span aria-current="page">{p.label}</span>
                    ) : (
                      <Link href={p.href}>{p.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className={styles.body}>
            {doc.blocks.map((b, i) => {
              switch (b.kind) {
                case "h2":
                  return (
                    <h2 key={i} id={b.id} className={styles.h2}>
                      {b.text}
                    </h2>
                  );
                case "meta":
                  return (
                    <p key={i} className={styles.meta}>
                      {renderInline(b.content)}
                    </p>
                  );
                case "p":
                  return <p key={i}>{renderInline(b.content)}</p>;
                case "ul":
                  return (
                    <ul key={i} className={styles.list}>
                      {b.items.map((it, j) => (
                        <li key={j}>{renderInline(it)}</li>
                      ))}
                    </ul>
                  );
                case "ol":
                  return (
                    <ol key={i} className={styles.list}>
                      {b.items.map((it, j) => (
                        <li key={j}>{renderInline(it)}</li>
                      ))}
                    </ol>
                  );
                case "table":
                  return (
                    <div key={i} className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            {b.head.map((c, j) => (
                              <th key={j} scope="col">
                                {renderInline(c)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {b.rows.map((r, j) => (
                            <tr key={j}>
                              {r.map((c, k) => (
                                <td key={k} data-label={plain(b.head[k] ?? [])}>
                                  {renderInline(c)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
              }
            })}
          </article>
        </div>
      </div>
    </main>
  );
}

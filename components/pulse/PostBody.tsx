import type { Block } from "@/lib/pulse";
import { renderInline } from "./inline";
import styles from "./Article.module.css";

// Renders the parsed Markdown block tree for a single post. Tables are a
// first-class feature of these posts, so they get a horizontal-scroll wrapper
// and mono small-caps headers; the single dashboard image renders full width.
export default function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className={styles.h2}>
                {renderInline(block.text, `h${i}`)}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i} className={styles.p}>
                {renderInline(block.text.replace(/\n/g, " "), `p${i}`)}
              </p>
            );
          case "image":
            return (
              <figure key={i} className={styles.figure}>
                {/* Repo convention: plain img with lazy loading (see Nav). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.src}
                  alt={block.alt}
                  loading="lazy"
                  className={styles.image}
                />
              </figure>
            );
          case "hr":
            return <hr key={i} className={styles.rule} />;
          case "table":
            return (
              <div key={i} className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {block.headers.map((h, hi) => (
                        <th key={hi}>{renderInline(h, `t${i}h${hi}`)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{renderInline(cell, `t${i}r${ri}c${ci}`)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

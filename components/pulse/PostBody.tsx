import type { ReactNode } from "react";
import type { Block } from "@/lib/pulse";
import DayOneOffer from "@/components/DayOneOffer";
import LiveRow from "./LiveRow";
import { renderInline } from "./inline";
import styles from "./Article.module.css";

// A sentence that states the Day One offer is written once with its closed alternative:
//
//   {{if dayOne.open}}The first 100 listeners get £6.99. {{else}}All 100 places have gone. {{end}}
//
// The closed branch is what the static HTML ships and what every failure shows; the open branch
// replaces it only when the platform has answered `true`. `{{else}}` may be omitted, which means
// "say nothing when closed". Board rows 2965 and 2967; `work_items` 225.
const LIVE = /\{\{if dayOne\.open\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{end\}\}/g;
const ROW_MARKER = "{{row dayOne.open}}";

function renderLive(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  LIVE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LIVE.exec(text)) !== null) {
    if (m.index > last) out.push(...renderInline(text.slice(last, m.index), `${key}s${n}`));
    out.push(
      <DayOneOffer
        key={`${key}o${n}`}
        open={renderInline(m[1], `${key}o${n}a`)}
        closed={renderInline(m[2] ?? "", `${key}o${n}b`)}
      />,
    );
    last = m.index + m[0].length;
    n++;
  }
  if (last < text.length) out.push(...renderInline(text.slice(last), `${key}s${n}`));
  return out;
}

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
                {renderLive(block.text.replace(/\n/g, " "), `p${i}`)}
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
                    {block.rows.map((row, ri) => {
                      const live = row[0]?.startsWith(ROW_MARKER) ?? false;
                      const cells = live ? [row[0].slice(ROW_MARKER.length), ...row.slice(1)] : row;
                      const tds = cells.map((cell, ci) => (
                        <td key={ci}>{renderInline(cell, `t${i}r${ri}c${ci}`)}</td>
                      ));
                      return live ? <LiveRow key={ri}>{tds}</LiveRow> : <tr key={ri}>{tds}</tr>;
                    })}
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

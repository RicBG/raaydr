import Link from "next/link";
import type { ReactNode } from "react";

// Inline Markdown for The Pulse: bold, italic, inline code and links. The
// content set is small and trusted, so a single-pass tokenizer covers every
// construct the posts actually use. Internal links route through next/link;
// external links open with rel="noopener".

const TOKEN =
  /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g;

function renderLink(href: string, label: string, key: string): ReactNode {
  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) {
    return (
      <Link key={key} href={href} className="link-sweep">
        {label}
      </Link>
    );
  }
  return (
    <a
      key={key}
      href={href}
      className="link-sweep"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}

export function renderInline(text: string, keyPrefix = ""): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyPrefix}i${i++}`;
    if (m[1] !== undefined) {
      nodes.push(renderLink(m[2], m[1], key));
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={key}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      nodes.push(<code key={key}>{m[4]}</code>);
    } else if (m[5] !== undefined) {
      nodes.push(<em key={key}>{m[5]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

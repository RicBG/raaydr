import fs from "node:fs";
import path from "node:path";

/*
 * The legal pages (terms, website terms, privacy, cookies) are published
 * VERBATIM from the approved text, which lives in content/legal/*.md. The
 * wording is Ric's, approved 3 October 2026 (board rows 2558, 2559), with the
 * corrections he ruled at 09:30 the same day (rows 2570, 2571). Nothing on the
 * page may paraphrase it, so the page renders the file rather than retyping it.
 *
 * The parser understands only what those files use: one "# " title, an
 * italic version line, "## " sections, paragraphs, "- " and "1. " lists,
 * pipe tables, and **bold**, *italic* and [links](url) inline. Anything else
 * renders as a plain paragraph, which is the safe way for it to fail.
 */

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "bold"; children: Inline[] }
  | { kind: "italic"; children: Inline[] }
  | { kind: "link"; href: string; children: Inline[] };

export type LegalBlock =
  | { kind: "h2"; id: string; text: string }
  | { kind: "p"; content: Inline[] }
  | { kind: "meta"; content: Inline[] }
  | { kind: "ul"; items: Inline[][] }
  | { kind: "ol"; items: Inline[][] }
  | { kind: "table"; head: Inline[][]; rows: Inline[][][] };

export type LegalDoc = {
  title: string;
  blocks: LegalBlock[];
  sections: { id: string; text: string }[];
};

export type LegalSlug = "terms" | "website-terms" | "privacy" | "cookies";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) out.push({ kind: "text", text: buf });
    buf = "";
  };
  while (i < src.length) {
    if (src.startsWith("**", i)) {
      const end = src.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ kind: "bold", children: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (src[i] === "*" && src[i + 1] !== "*") {
      const end = src.indexOf("*", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ kind: "italic", children: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    if (src[i] === "[") {
      const close = src.indexOf("](", i);
      const end = close === -1 ? -1 : src.indexOf(")", close + 2);
      if (close > i && end > close) {
        flush();
        out.push({
          kind: "link",
          href: src.slice(close + 2, end),
          children: parseInline(src.slice(i + 1, close)),
        });
        i = end + 1;
        continue;
      }
    }
    buf += src[i];
    i += 1;
  }
  flush();
  return out;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function parseLegal(raw: string): LegalDoc {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  const blocks: LegalBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i += 1;
      continue;
    }
    if (t.startsWith("# ")) {
      title = t.slice(2).trim();
      i += 1;
      continue;
    }
    if (t.startsWith("## ")) {
      const text = t.slice(3).trim();
      blocks.push({ kind: "h2", id: slugify(text), text });
      i += 1;
      continue;
    }
    if (t.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      const [head, sep, ...body] = rows;
      const hasSep = sep && sep.every((c) => /^:?-{3,}:?$/.test(c));
      blocks.push({
        kind: "table",
        head: head.map(parseInline),
        rows: (hasSep ? body : rows.slice(1)).map((r) => r.map(parseInline)),
      });
      continue;
    }
    if (/^- /.test(t)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^- /.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().slice(2)));
        i += 1;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }
    if (/^\d+\. /.test(t)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^\d+\. /, "")));
        i += 1;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }
    // A paragraph runs until a blank line or the start of another block.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,2} |- |\d+\. |\|)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i += 1;
    }
    const text = para.join(" ");
    const isMeta = /^\*[^*].*\*$/.test(text);
    blocks.push(
      isMeta
        ? { kind: "meta", content: parseInline(text.slice(1, -1)) }
        : { kind: "p", content: parseInline(text) },
    );
  }
  const sections = blocks
    .filter((b): b is Extract<LegalBlock, { kind: "h2" }> => b.kind === "h2")
    .map(({ id, text }) => ({ id, text }));
  return { title, blocks, sections };
}

export function readLegal(slug: LegalSlug): LegalDoc {
  const file = path.join(process.cwd(), "content", "legal", `${slug}.md`);
  return parseLegal(fs.readFileSync(file, "utf8"));
}

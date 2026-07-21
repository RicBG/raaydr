import fs from "node:fs";
import path from "node:path";

// The Pulse (RAAYDR blog) content loader. Reads content/pulse/*.md at build
// time, parses the frontmatter and a small, controlled subset of Markdown
// (headings, paragraphs, tables, one image, horizontal rules) into a typed
// block tree that the server components render. No runtime dependency: the
// content is fully known and trusted, so a tiny hand-rolled parser keeps the
// section dependency-free and statically generated.

export type Accent = "green" | "amber" | "coral" | "violet" | "orchid";

export interface PostMeta {
  title: string;
  slug: string;
  description: string;
  datePublished: string;
  dateUpdated: string;
  author: string;
  accent: Accent;
  readingTime: string;
  heroImage: string;
  heroAlt: string;
}

export type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string }
  | { type: "hr" }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Post extends PostMeta {
  blocks: Block[];
  faq: FaqItem[];
  note?: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "pulse");

// The launch cohort all share one publish date, so a pure date sort is a tie.
// This is the intended editorial order (cornerstone per-stream piece first),
// used only to break that tie deterministically.
const EDITORIAL_ORDER = [
  "how-much-does-spotify-pay-per-stream",
  "how-many-streams-for-1000-a-month",
  "best-spotify-alternatives-independent-artists",
  "what-is-attention-based-streaming-payment",
  "how-producers-and-songwriters-get-paid",
  "what-is-raaydr",
];

function orderIndex(slug: string): number {
  const i = EDITORIAL_ORDER.indexOf(slug);
  return i === -1 ? EDITORIAL_ORDER.length : i;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body: raw.slice(match[0].length) };
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line.trim());
}

// Break the Markdown body into blocks. Blank lines separate paragraphs;
// pipe-led runs form tables; `#` lines are headings; `![]()` is an image;
// a lone `---`/`***` is a rule.
function parseBlocks(body: string): Block[] {
  const lines = body.split(/\r?\n/);
  const blocks: Block[] = [];
  let para: string[] = [];

  const flush = () => {
    if (para.length) {
      blocks.push({ type: "paragraph", text: para.join("\n").trim() });
      para = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flush();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() });
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flush();
      blocks.push({ type: "hr" });
      continue;
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flush();
      blocks.push({ type: "image", alt: image[1], src: image[2] });
      continue;
    }

    if (trimmed.startsWith("|")) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const current = lines[i].trim();
        if (!isTableSeparator(current)) rows.push(splitTableRow(current));
        i++;
      }
      i--; // step back; outer loop will advance
      if (rows.length) {
        const [headers, ...bodyRows] = rows;
        blocks.push({ type: "table", headers, rows: bodyRows });
      }
      continue;
    }

    para.push(line);
  }
  flush();
  return blocks;
}

function stripBold(text: string): string {
  return text.replace(/^\*\*(.*)\*\*$/, "$1").trim();
}

function stripEmphasis(text: string): string {
  return text.replace(/^\*(.*)\*$/, "$1").trim();
}

// Separate the leading title/byline (represented by the page chrome), the
// main body, the FAQ block, and the trailing disclaimer note.
function structure(blocks: Block[]): { blocks: Block[]; faq: FaqItem[]; note?: string } {
  // Drop the level-1 title and the "The RAAYDR Blog" / byline paragraph:
  // both are rendered from frontmatter as the page header.
  let start = 0;
  while (start < blocks.length) {
    const b = blocks[start];
    if (b.type === "heading" && b.level === 1) {
      start++;
      continue;
    }
    if (b.type === "paragraph" && b.text.includes("The RAAYDR Blog")) {
      start++;
      continue;
    }
    break;
  }
  const rest = blocks.slice(start);

  const faqIdx = rest.findIndex(
    (b) => b.type === "heading" && b.level === 2 && b.text.toUpperCase() === "FAQ"
  );

  if (faqIdx === -1) {
    return { blocks: rest, faq: [] };
  }

  const main = rest.slice(0, faqIdx);
  const tail = rest.slice(faqIdx + 1);

  const faq: FaqItem[] = [];
  let note: string | undefined;
  for (const b of tail) {
    if (b.type === "hr") continue;
    if (b.type !== "paragraph") continue;
    const nl = b.text.indexOf("\n");
    const firstLine = nl === -1 ? b.text : b.text.slice(0, nl);
    if (/^\*\*.*\*\*$/.test(firstLine.trim())) {
      faq.push({
        question: stripBold(firstLine.trim()),
        answer: nl === -1 ? "" : b.text.slice(nl + 1).trim(),
      });
    } else if (/^\*[^*].*\*$/.test(b.text.trim())) {
      note = stripEmphasis(b.text.trim());
    }
  }

  return { blocks: main, faq, note };
}

function readPost(slug: string): Post {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const { blocks, faq, note } = structure(parseBlocks(body));
  return {
    title: meta.title ?? "",
    slug: meta.slug || slug,
    description: meta.description ?? "",
    datePublished: meta.datePublished ?? "",
    dateUpdated: meta.dateUpdated ?? "",
    author: meta.author ?? "",
    accent: (meta.accent as Accent) || "green",
    readingTime: meta.readingTime ?? "",
    heroImage: meta.heroImage ?? "",
    heroAlt: meta.heroAlt ?? "",
    blocks,
    faq,
    note,
  };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Deterministic date formatting (no locale/timezone dependence, so server and
// client markup always match): "2026-07-21" becomes "21 Jul 2026".
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

// Metadata for every post, newest first.
export function getAllPosts(): PostMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const p = readPost(slug);
      const { blocks: _blocks, faq: _faq, note: _note, ...meta } = p;
      void _blocks;
      void _faq;
      void _note;
      return meta;
    })
    .sort((a, b) => {
      const byDate = b.datePublished.localeCompare(a.datePublished);
      return byDate !== 0 ? byDate : orderIndex(a.slug) - orderIndex(b.slug);
    });
}

export function getPost(slug: string): Post | null {
  try {
    return readPost(slug);
  } catch {
    return null;
  }
}

import fs from "node:fs";
import path from "node:path";
import {
  artistEarnings,
  equivalentStreams,
  spotifyEquivalentStreams,
  CANONICAL,
  DISTRIBUTABLE,
  PER_FAN,
  PLATFORM_PER_STREAM_ESTIMATES,
  SPOTIFY,
} from "./raaydrRates";

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

/**
 * Figures the posts are not allowed to spell out for themselves.
 *
 * Prose drifts. A pound figure typed into a post is a copy of a rate, and
 * copies go stale silently: the £700 that sat in the alternatives post was the
 * calculator's £712 from an earlier rate pass, and nothing caught it for two
 * releases. Anything here is substituted from lib/raaydrRates.ts at build
 * time, so a rate change rewrites the posts instead of stranding them.
 *
 * This covers the recurring cross-post figures, not every number in the blog.
 * Post-specific working (per-platform estimates, stream-count tables) stays
 * inline where it is written and argued.
 */
/**
 * The worked example the posts return to. Editorial, not a rate: it is the
 * audience shape the argument is made about. Both platform figures are
 * computed from it, so the two sides of the comparison can never drift apart.
 */
const SCENARIO_FANS = 500;
const SCENARIO_ATTENTION = 40;

const CONTENT_TOKENS: Record<string, string> = {
  "canonical.claim": CANONICAL.claim,
  "canonical.denominator": CANONICAL.denominator,
  "canonical.typicalPair": CANONICAL.typicalPair,
  "canonical.artistPerFan": money(CANONICAL.artistPerFan),
  /** Plays it takes to match one fan at the default attention share. */
  "canonical.typicalStreams": count(CANONICAL.typicalStreams),
  "spotify.subscriptionPrice": money(SPOTIFY.subscriptionPrice),
  "spotify.perStream": rate(SPOTIFY.perStream),
  // Per-stream estimates and the plays each implies to match one RAAYDR fan.
  // Both columns of that table read from the same constant, so the rate and the
  // figure beside it cannot drift apart again.
  //
  // This column used to read "one engaged fan is worth £x", computed by
  // multiplying each rate by 80 assumed plays a month. The 80 had no source, so
  // the column is now the plays needed to match £3.56 — the same rates, divided
  // rather than multiplied, and no assumption about anyone's listening.
  "spotify.streamsPerFan": count(
    equivalentStreams(PER_FAN.artist.standard, SPOTIFY.perStream)
  ),
  "platform.youtubeMusic.perStream": rate(PLATFORM_PER_STREAM_ESTIMATES.youtubeMusic),
  "platform.youtubeMusic.streamsPerFan": count(
    equivalentStreams(PER_FAN.artist.standard, PLATFORM_PER_STREAM_ESTIMATES.youtubeMusic)
  ),
  "platform.appleMusic.perStream": rate(PLATFORM_PER_STREAM_ESTIMATES.appleMusic),
  "platform.appleMusic.streamsPerFan": count(
    equivalentStreams(PER_FAN.artist.standard, PLATFORM_PER_STREAM_ESTIMATES.appleMusic)
  ),
  // Distributable revenue. Published figure, not derived from PER_FAN: see the
  // note on DISTRIBUTABLE in raaydrRates.
  "rates.distributable.standard": money(DISTRIBUTABLE.standard),
  // Per-fan artist rates, per price band. Cited across four posts.
  "rates.perFan.standard": money(PER_FAN.artist.standard),
  "rates.perFan.dayOne": money(PER_FAN.artist.dayOne),
  "rates.perFan.dayOneNext": money(PER_FAN.artist.dayOneNext),
  // The worked scenario the posts share: 500 genuine fans at a 40% share.
  "scenario.fans": "500",
  "scenario.attention": "40%",
  "scenario.raaydrMonthly": money(artistEarnings(SCENARIO_FANS, SCENARIO_ATTENTION)),
  "scenario.raaydrAnnual": money(
    artistEarnings(SCENARIO_FANS, SCENARIO_ATTENTION) * 12
  ),
  /** What one fan at the scenario's attention share sends you. */
  "scenario.perFan": money(artistEarnings(1, SCENARIO_ATTENTION)),
  // Reach, in streams. Rounded to the nearest thousand because every use of it
  // is prefixed "roughly"; the exact figure is 237,333.
  "scenario.spotifyStreams": nearestThousand(
    spotifyEquivalentStreams(artistEarnings(SCENARIO_FANS, SCENARIO_ATTENTION))
  ),
  "scenario.spotifyStreamsAnnual": nearestThousand(
    spotifyEquivalentStreams(artistEarnings(SCENARIO_FANS, SCENARIO_ATTENTION) * 12)
  ),
};

/** Thousands separator, rounded to the nearest thousand for prose. */
function nearestThousand(value: number): string {
  return (Math.round(value / 1000) * 1000).toLocaleString("en-GB");
}

/** Exact counts, grouped. Stream figures small enough to state precisely. */
function count(value: number): string {
  return value.toLocaleString("en-GB");
}

/** Pounds, grouped, with the pence dropped when there are none. */
function money(amount: number): string {
  const fixed = amount.toFixed(2).replace(/\.00$/, "");
  const [whole, fraction] = fixed.split(".");
  const grouped = Number(whole).toLocaleString("en-GB");
  return `£${grouped}${fraction ? `.${fraction}` : ""}`;
}

/** Per-stream rates, which run to four decimal places. £0.003, £0.0015. */
function rate(amount: number): string {
  return `£${amount.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;
}

/**
 * Replace {{token}} with its figure. An unknown token throws rather than
 * rendering braces to a reader: a typo in a post should fail the build, not
 * ship.
 */
function substituteTokens(raw: string, slug: string): string {
  return raw.replace(/\{\{([\w.]+)\}\}/g, (_match, name: string) => {
    const value = CONTENT_TOKENS[name];
    if (value === undefined) {
      throw new Error(
        `Unknown content token {{${name}}} in content/pulse/${slug}.md. ` +
          `Known tokens: ${Object.keys(CONTENT_TOKENS).join(", ")}`
      );
    }
    return value;
  });
}

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
  const raw = substituteTokens(
    fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf8"),
    slug
  );
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

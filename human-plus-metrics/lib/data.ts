import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabase";

/* ============================================================
   Server-side reads. Everything renders from Supabase at request
   time — no metrics data lives in this codebase. A weekly update
   is a row written to the database, never a deploy.
   ============================================================ */

export type ChannelKey = "li" | "ig" | "th" | "tk" | "x";
export type ChannelMap = Record<ChannelKey, number>;

export interface Week {
  id: string; // week_start, e.g. "2026-07-06"
  label: string; // "6 Jul"
  ending: string; // "12 July 2026"
  posts: number;
  reach: number;
  followers: number;
  comments: number;
  shares: number;
  clicks: number;
  web: number | null; // null = not measured, which is not the same as zero
  mentions: number;
  partial: boolean;
  ch: ChannelMap;
  chPosts: ChannelMap;
  chFoll: ChannelMap;
}

export interface Month {
  id: string; // "2026-07"
  label: string; // "July"
  note: string;
  partial: boolean;
  reach: number;
  posts: number;
  web: number | null;
  ch: ChannelMap;
  chPosts: ChannelMap;
  from: ChannelMap;
  to: ChannelMap;
}

export interface GrowthPoint extends ChannelMap {
  date: string; // "12 Jul"
}

export interface WeekNotes {
  read: string;
  problem: string;
  next: string;
}

interface WeeklyRow {
  week_start: string;
  week_ending: string;
  posts: number;
  reach: number;
  followers: number;
  comments: number;
  shares: number;
  clicks: number;
  web_visits: number | null;
  mentions: number;
  channel_reach: ChannelMap;
  channel_posts: ChannelMap;
  channel_followers: ChannelMap;
  partial: boolean;
}

interface MonthlyRow {
  month: string;
  label: string;
  sort_order: number;
  reach: number;
  posts: number;
  web_visits: number | null;
  partial: boolean;
  note: string | null;
  channel_reach: ChannelMap;
  channel_posts: ChannelMap;
  followers_from: ChannelMap;
  followers_to: ChannelMap;
}

interface NotesRow {
  week_start: string;
  read: string | null;
  problem: string | null;
  next: string | null;
}

/* Postgres dates arrive as "YYYY-MM-DD"; pin to UTC so the label never
   shifts a day with the server's timezone. */
const asUTC = (d: string) => new Date(`${d}T00:00:00Z`);

const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const longDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function serverClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface DashboardData {
  weeks: Week[];
  months: Month[];
  growth: GrowthPoint[];
  notes: Record<string, WeekNotes>;
}

export async function getDashboardData(): Promise<DashboardData> {
  const sb = serverClient();

  const [weeklyRes, monthlyRes, notesRes] = await Promise.all([
    sb.from("weekly_metrics").select("*").order("week_start", { ascending: true }),
    sb.from("monthly_metrics").select("*").order("sort_order", { ascending: true }),
    sb.from("weekly_notes").select("*").order("week_start", { ascending: true }),
  ]);

  if (weeklyRes.error) throw new Error(`weekly_metrics: ${weeklyRes.error.message}`);
  if (monthlyRes.error) throw new Error(`monthly_metrics: ${monthlyRes.error.message}`);
  if (notesRes.error) throw new Error(`weekly_notes: ${notesRes.error.message}`);

  const weeks: Week[] = (weeklyRes.data as WeeklyRow[]).map((r) => ({
    id: r.week_start,
    label: shortDate.format(asUTC(r.week_start)),
    ending: longDate.format(asUTC(r.week_ending)),
    posts: r.posts,
    reach: r.reach,
    followers: r.followers,
    comments: r.comments,
    shares: r.shares,
    clicks: r.clicks,
    web: r.web_visits,
    mentions: r.mentions,
    partial: r.partial,
    ch: r.channel_reach,
    chPosts: r.channel_posts,
    chFoll: r.channel_followers,
  }));

  const months: Month[] = (monthlyRes.data as MonthlyRow[]).map((r) => ({
    id: r.month,
    label: r.label,
    note: r.note ?? "",
    partial: r.partial,
    reach: r.reach,
    posts: r.posts,
    web: r.web_visits,
    ch: r.channel_reach,
    chPosts: r.channel_posts,
    from: r.followers_from,
    to: r.followers_to,
  }));

  /* End-of-week follower snapshots for the growth chart, derived from
     weekly_metrics.channel_followers — it needs no table of its own. */
  const growth: GrowthPoint[] = (weeklyRes.data as WeeklyRow[]).map((r) => ({
    date: shortDate.format(asUTC(r.week_ending)),
    ...r.channel_followers,
  }));

  const notes: Record<string, WeekNotes> = {};
  for (const r of notesRes.data as NotesRow[]) {
    notes[r.week_start] = {
      read: r.read ?? "",
      problem: r.problem ?? "",
      next: r.next ?? "",
    };
  }

  return { weeks, months, growth, notes };
}

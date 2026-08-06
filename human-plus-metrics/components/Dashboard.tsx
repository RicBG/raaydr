"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { getBrowserClient } from "@/lib/supabase";
import type { ChannelKey, DashboardData, GrowthPoint, Month, Week, WeekNotes } from "@/lib/data";

/* ============================================================
   HUMAN PLUS — WEEKLY MARKETING READOUT
   Every figure renders from Supabase at request time. Updating a
   week is a row written to the database, never a deploy.
   Source: Metricool (brand humanplusltd) + GA4 (human.plus) via Windsor.ai
   ============================================================ */

const CHANNELS: { key: ChannelKey; name: string; metric: string }[] = [
  { key: "li", name: "LinkedIn", metric: "impressions" },
  { key: "tk", name: "TikTok", metric: "video views" },
  { key: "ig", name: "Instagram", metric: "account reach" },
  { key: "th", name: "Threads", metric: "post views" },
  { key: "x", name: "X", metric: "impressions" },
];

const EMPTY_NOTES: WeekNotes = { read: "", problem: "", next: "" };

const C = {
  ground: "#1B1D22", panel: "#24272E", panelHi: "#2B2F37", rule: "#363B45",
  ink: "#EDEAE3", muted: "#8A8F9C", dim: "#5F646F",
  signal: "#D8A03D", cool: "#6E9BC4", dead: "#B4483C", good: "#7FA88B",
};

const fmt = (n: number) => n.toLocaleString("en-GB");

function Meter({ ch, value, max, posts, followers, active, onClick }: {
  ch: { key: ChannelKey; name: string; metric: string };
  value: number; max: number; posts: number; followers: number;
  active: boolean; onClick: () => void;
}) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 2;
  const isDead = value < 10;
  const colour = isDead ? C.dead : active ? C.signal : C.cool;
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? C.panelHi : "transparent",
        border: `1px solid ${active ? C.rule : "transparent"}`,
        borderRadius: 4, padding: "12px 8px 10px", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        flex: 1, minWidth: 0, transition: "background 150ms",
      }}
      aria-pressed={active}
    >
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.ink, fontWeight: 500 }}>
        {fmt(value)}
      </span>
      <div style={{ position: "relative", width: 26, height: 150, background: "#15171B", borderRadius: 2, overflow: "hidden", border: `1px solid ${C.rule}` }}>
        {[25, 50, 75].map((t) => (
          <div key={t} style={{ position: "absolute", bottom: `${t}%`, left: 0, right: 0, height: 1, background: "#22252B" }} />
        ))}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`,
          background: colour, transition: "height 500ms cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, letterSpacing: "0.08em",
        textTransform: "uppercase", color: isDead ? C.dead : C.ink, fontWeight: 600,
      }}>
        {ch.name}
      </span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.dim, lineHeight: 1.5, textAlign: "center" }}>
        {posts} posts<br />{followers} foll.
      </span>
    </button>
  );
}

function Stat({ label, value, sub, tone }: {
  label: string; value: string | number; sub?: string | null; tone?: string;
}) {
  return (
    <div style={{ padding: "14px 16px", background: C.panel, borderRadius: 4, border: `1px solid ${C.rule}`, flex: 1, minWidth: 130 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, color: tone || C.ink, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 6, fontFamily: "'IBM Plex Sans', sans-serif" }}>{sub}</div>}
    </div>
  );
}

function NoteBlock({ id, title, hint, value, onChange, editing }: {
  id: keyof WeekNotes; title: string; hint: string; value: string;
  onChange: (id: keyof WeekNotes, value: string) => void; editing: boolean;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: C.signal, marginBottom: 8 }}>
        {title}
      </div>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          rows={Math.max(4, value.split("\n").length + 1)}
          style={{
            width: "100%", background: "#15171B", color: C.ink, border: `1px solid ${C.rule}`,
            borderRadius: 4, padding: 12, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14,
            lineHeight: 1.65, resize: "vertical",
          }}
          placeholder={hint}
        />
      ) : (
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14.5, lineHeight: 1.7, color: "#D6D3CC", whiteSpace: "pre-wrap" }}>
          {value || <span style={{ color: C.dim }}>{hint}</span>}
        </div>
      )}
    </div>
  );
}

const CH_COLOUR: Record<ChannelKey, string> = { li: "#D8A03D", ig: "#6E9BC4", th: "#7FA88B", tk: "#B07FC4", x: "#B4483C" };

function MonthView({ months, growth }: { months: Month[]; growth: GrowthPoint[] }) {
  const [monthId, setMonthId] = useState(() => {
    const complete = months.filter((x) => !x.partial);
    return (complete.length > 0 ? complete[complete.length - 1] : months[months.length - 1]).id;
  });
  const m = months.find((x) => x.id === monthId) ?? months[months.length - 1];
  const growthPct = (c: ChannelKey) => {
    if (m.from[c] === 0) return m.to[c] > 0 ? "new" : "flat";
    const d = Math.round(((m.to[c] - m.from[c]) / m.from[c]) * 100);
    return (d > 0 ? "+" : "") + d + "%";
  };
  const totFrom = Object.values(m.from).reduce((a, b) => a + b, 0);
  const totTo = Object.values(m.to).reduce((a, b) => a + b, 0);

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {months.map((x) => (
          <button key={x.id} onClick={() => setMonthId(x.id)}
            style={{
              background: x.id === monthId ? C.signal : "transparent",
              color: x.id === monthId ? C.ground : C.muted,
              border: `1px solid ${x.id === monthId ? C.signal : C.rule}`,
              borderRadius: 3, padding: "6px 15px", cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
            }}>
            {x.label}
          </button>
        ))}
      </div>

      {m.partial && (
        <div style={{ padding: "10px 14px", marginBottom: 18, background: "#2A2019", border: `1px solid ${C.dead}`, borderRadius: 4, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "#E0BCB4" }}>
          Part month, {m.note}. Do not compare it like for like against a complete month.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
        <Stat label="Reach" value={fmt(m.reach)} sub={m.note} />
        <Stat label="Followers" value={`${totFrom} → ${totTo}`} sub={`${totTo - totFrom >= 0 ? "+" : ""}${totTo - totFrom} over the month`} tone={C.good} />
        <Stat label="Posts" value={m.posts} sub="all channels" />
        <Stat label="Site visits" value={m.web == null ? "no data" : fmt(m.web)} sub={m.web == null ? "GA4 starts 7 July" : "sessions on human.plus"} tone={m.web != null && m.web < 200 ? C.dead : C.ink} />
      </div>

      <section style={{ marginBottom: 34 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px", fontWeight: 600 }}>
          Where the audience is building
        </h2>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, margin: "0 0 16px", maxWidth: 640, lineHeight: 1.6 }}>
          Followers per channel, end of each week. The gap between the top two lines and the bottom three is the whole strategy question.
        </p>
        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 5, padding: "18px 10px 8px", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growth} margin={{ top: 4, right: 14, left: -18, bottom: 4 }}>
              <CartesianGrid stroke={C.rule} vertical={false} />
              <XAxis dataKey="date" stroke={C.dim} tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} tickLine={false} />
              <YAxis stroke={C.dim} tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#15171B", border: `1px solid ${C.rule}`, borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12 }} labelStyle={{ color: C.muted }} />
              <Legend wrapperStyle={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", paddingTop: 8 }} />
              {CHANNELS.map((ch) => (
                <Line key={ch.key} type="monotone" dataKey={ch.key} name={ch.name}
                  stroke={CH_COLOUR[ch.key]} strokeWidth={2.2} dot={{ r: 2.5, fill: CH_COLOUR[ch.key] }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={{ marginBottom: 34 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px", fontWeight: 600 }}>
          {m.label} by channel
        </h2>
        <div style={{ overflowX: "auto", background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 5, padding: "4px 14px 6px" }}>
          <table>
            <thead>
              <tr><th>Channel</th><th>Posts</th><th>Reach</th><th>Reach / post</th><th>Followers</th><th>Growth</th></tr>
            </thead>
            <tbody>
              {[...CHANNELS].sort((a, b) => m.ch[b.key] - m.ch[a.key]).map((ch) => {
                const per = m.chPosts[ch.key] > 0 ? Math.round(m.ch[ch.key] / m.chPosts[ch.key]) : 0;
                const g = growthPct(ch.key);
                return (
                  <tr key={ch.key}>
                    <td style={{ color: CH_COLOUR[ch.key], fontWeight: 500 }}>{ch.name}</td>
                    <td>{m.chPosts[ch.key]}</td>
                    <td>{fmt(m.ch[ch.key])}</td>
                    <td style={{ color: C.muted }}>{fmt(per)}</td>
                    <td>{m.from[ch.key]} → {m.to[ch.key]}</td>
                    <td style={{ color: g === "flat" ? C.dead : g.startsWith("-") ? C.dead : C.good }}>{g}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: C.dim, marginTop: 10, lineHeight: 1.6 }}>
          Reach per post is the honest efficiency measure. High reach off few posts is the algorithm, not an audience, unless followers move with it.
        </p>
      </section>
    </>
  );
}

export default function Dashboard({ weeks, months, growth, notes: initialNotes }: DashboardData) {
  const [mode, setMode] = useState<"week" | "month">("week");
  const [weekIdx, setWeekIdx] = useState(weeks.length - 1);
  const [activeCh, setActiveCh] = useState<ChannelKey | null>(null);
  const [notesByWeek, setNotesByWeek] = useState(initialNotes);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const week = weeks[weekIdx];
  const prev = weekIdx > 0 ? weeks[weekIdx - 1] : null;
  const maxCh = Math.max(...Object.values(week.ch));
  const notes = notesByWeek[week.id] ?? EMPTY_NOTES;

  const setNote = (id: keyof WeekNotes, value: string) =>
    setNotesByWeek({ ...notesByWeek, [week.id]: { ...notes, [id]: value } });

  const startEditing = async () => {
    const sb = getBrowserClient();
    const { data } = await sb.auth.getSession();
    if (data.session) {
      setSignedIn(true);
      setEditing(true);
    } else {
      setShowSignIn(true);
    }
  };

  const signIn = async () => {
    setAuthError("");
    const sb = getBrowserClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError("Sign in failed. Check the email and password.");
      return;
    }
    setSignedIn(true);
    setShowSignIn(false);
    setPassword("");
    setEditing(true);
  };

  const save = async () => {
    const sb = getBrowserClient();
    const { error } = await sb.from("weekly_notes").upsert({
      week_start: week.id,
      read: notes.read,
      problem: notes.problem,
      next: notes.next,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setStatus("Could not save. Copy your text out before leaving.");
    } else {
      setStatus("Saved. The team will see this.");
      setEditing(false);
    }
    setTimeout(() => setStatus(""), 4000);
  };

  const trend = weeks.map((w) => ({
    week: w.label, LinkedIn: w.ch.li, "Site visits": w.web, Reach: w.reach,
  }));

  const delta = (cur: number | null, old: number | null) => {
    if (cur == null || old == null || old === 0) return null;
    const d = Math.round(((cur - old) / old) * 100);
    return (d > 0 ? "+" : "") + d + "%";
  };

  const visitsDelta = prev ? delta(week.web, prev.web) : null;

  return (
    <div style={{ background: C.ground, minHeight: "100%", color: C.ink, padding: "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible, textarea:focus-visible, input:focus-visible { outline: 2px solid ${C.signal}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
        table { border-collapse: collapse; width: 100%; }
        td, th { padding: 9px 10px; text-align: right; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; border-bottom: 1px solid ${C.rule}; }
        th:first-child, td:first-child { text-align: left; font-family: 'IBM Plex Sans', sans-serif; }
        th { color: ${C.muted}; font-weight: 500; font-family: 'Barlow Condensed', sans-serif !important; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
      `}</style>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <header style={{ padding: "34px 0 22px", borderBottom: `1px solid ${C.rule}` }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: C.signal, marginBottom: 10 }}>
            Human Plus · Marketing
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(34px, 6vw, 54px)", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1, margin: "0 0 12px" }}>
            Week ending {week.ending}
          </h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: C.muted, maxWidth: 620, lineHeight: 1.6, margin: 0 }}>
            Five channels, one site. Figures pulled from Metricool and GA4, not typed in by hand.
          </p>
        </header>

        {/* Mode toggle */}
        <div style={{ display: "inline-flex", marginTop: 20, border: `1px solid ${C.rule}`, borderRadius: 4, overflow: "hidden" }}>
          {(["week", "month"] as const).map((mm) => (
            <button key={mm} onClick={() => setMode(mm)}
              style={{
                background: mode === mm ? C.panelHi : "transparent",
                color: mode === mm ? C.ink : C.dim,
                border: "none", borderRight: mm === "week" ? `1px solid ${C.rule}` : "none",
                padding: "8px 20px", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14.5,
                letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600,
              }}>
              {mm === "week" ? "By week" : "By month"}
            </button>
          ))}
        </div>

        {/* Week selector */}
        <nav style={{ display: mode === "week" ? "flex" : "none", gap: 6, padding: "18px 0", flexWrap: "wrap" }}>
          {weeks.map((w, i) => (
            <button key={w.id} onClick={() => setWeekIdx(i)}
              style={{
                background: i === weekIdx ? C.signal : "transparent",
                color: i === weekIdx ? C.ground : C.muted,
                border: `1px solid ${i === weekIdx ? C.signal : C.rule}`,
                borderRadius: 3, padding: "6px 13px", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
                letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
              }}>
              w/c {w.label}
            </button>
          ))}
        </nav>

        {mode === "month" ? <MonthView months={months} growth={growth} /> : (<>
        {week.partial && (
          <div style={{ padding: "10px 14px", marginBottom: 18, background: "#2A2019", border: `1px solid ${C.dead}`, borderRadius: 4, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "#E0BCB4" }}>
            Part week. Do not compare it like for like against a complete week.
          </div>
        )}

        {/* Headline stats */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
          <Stat label="Reach" value={fmt(week.reach)} sub={prev ? `${delta(week.reach, prev.reach)} on last week` : "first full week"} />
          <Stat label="Followers" value={fmt(week.followers)} sub={prev ? `${week.followers - prev.followers >= 0 ? "+" : ""}${week.followers - prev.followers} on last week` : null} tone={C.good} />
          <Stat label="Posts" value={week.posts} sub="all channels" />
          {/* null renders as a gap, not a zero: a zero reads as a measurement */}
          <Stat label="Site visits" value={week.web == null ? "no data" : fmt(week.web)} sub={week.web == null ? "not measured this week" : visitsDelta ? `${visitsDelta} on last week` : null} tone={week.web != null && week.web < 20 ? C.dead : C.ink} />
          <Stat label="Comments" value={week.comments} sub={`${week.shares} shares`} />
        </div>

        {/* SIGNATURE: channel strip */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>
              Channel levels
            </h2>
            <span style={{ fontSize: 11.5, color: C.dim, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              tap a channel
            </span>
          </div>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, margin: "0 0 14px", maxWidth: 640, lineHeight: 1.6 }}>
            How far each channel carried this week, relative to the loudest one. Red means the channel is not registering.
          </p>
          <div style={{ display: "flex", gap: 6, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 5, padding: 10 }}>
            {CHANNELS.map((ch) => (
              <Meter key={ch.key} ch={ch} value={week.ch[ch.key]} max={maxCh}
                posts={week.chPosts[ch.key]} followers={week.chFoll[ch.key]}
                active={activeCh === ch.key}
                onClick={() => setActiveCh(activeCh === ch.key ? null : ch.key)} />
            ))}
          </div>
          {activeCh && (
            <div style={{ marginTop: 10, padding: "12px 14px", background: C.panelHi, border: `1px solid ${C.rule}`, borderRadius: 4, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, lineHeight: 1.6, color: "#D6D3CC" }}>
              <strong style={{ color: C.ink }}>{CHANNELS.find((c) => c.key === activeCh)!.name}</strong>{" "}
              measured as {CHANNELS.find((c) => c.key === activeCh)!.metric}.{" "}
              {fmt(week.ch[activeCh])} from {week.chPosts[activeCh]} post{week.chPosts[activeCh] === 1 ? "" : "s"}, ending the week on {week.chFoll[activeCh]} follower{week.chFoll[activeCh] === 1 ? "" : "s"}.
              {" "}Across the {weeks.length} weeks so far:{" "}
              {weeks.map((w) => fmt(w.ch[activeCh])).join(" · ")}.
            </div>
          )}
        </section>

        {/* The tension */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px", fontWeight: 600 }}>
            Reach up, visits down
          </h2>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.muted, margin: "0 0 16px", maxWidth: 640, lineHeight: 1.6 }}>
            LinkedIn impressions against sessions on human.plus. Different scales, same weeks.
          </p>
          <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 5, padding: "18px 10px 8px", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 14, left: -14, bottom: 4 }}>
                <CartesianGrid stroke={C.rule} vertical={false} />
                <XAxis dataKey="week" stroke={C.dim} tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} tickLine={false} />
                <YAxis yAxisId="l" stroke={C.dim} tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="r" orientation="right" stroke={C.dim} tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#15171B", border: `1px solid ${C.rule}`, borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12 }} labelStyle={{ color: C.muted }} />
                <Line yAxisId="l" type="monotone" dataKey="LinkedIn" stroke={C.signal} strokeWidth={2.5} dot={{ r: 3, fill: C.signal }} />
                <Line yAxisId="r" type="monotone" dataKey="Site visits" stroke={C.dead} strokeWidth={2.5} dot={{ r: 3, fill: C.dead }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        </>)}

        {/* Ric's read */}
        <section style={{ marginBottom: 36, background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 5, padding: "22px 22px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>
              The read
            </h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {status && <span style={{ fontSize: 12, color: C.good, fontFamily: "'IBM Plex Sans', sans-serif" }}>{status}</span>}
              {editing ? (
                <button onClick={save} style={{ background: C.signal, color: C.ground, border: "none", borderRadius: 3, padding: "7px 16px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                  Save notes
                </button>
              ) : (
                <button onClick={startEditing} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.rule}`, borderRadius: 3, padding: "7px 16px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {signedIn ? "Edit notes" : "Edit notes (sign in)"}
                </button>
              )}
            </div>
          </div>
          {showSignIn && !editing && (
            <div style={{ marginBottom: 20, padding: "14px 16px", background: C.panelHi, border: `1px solid ${C.rule}`, borderRadius: 4, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="username"
                style={{ background: "#15171B", color: C.ink, border: `1px solid ${C.rule}`, borderRadius: 3, padding: "8px 10px", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, flex: "1 1 180px" }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" autoComplete="current-password"
                onKeyDown={(e) => { if (e.key === "Enter") signIn(); }}
                style={{ background: "#15171B", color: C.ink, border: `1px solid ${C.rule}`, borderRadius: 3, padding: "8px 10px", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, flex: "1 1 140px" }} />
              <button onClick={signIn} style={{ background: C.signal, color: C.ground, border: "none", borderRadius: 3, padding: "8px 16px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                Sign in
              </button>
              {authError && <span style={{ fontSize: 12, color: C.dead, fontFamily: "'IBM Plex Sans', sans-serif", flexBasis: "100%" }}>{authError}</span>}
            </div>
          )}
          <NoteBlock id="read" title="What the numbers say" hint="Your read on the week." value={notes.read} onChange={setNote} editing={editing} />
          <NoteBlock id="problem" title="The problem" hint="What is not working." value={notes.problem} onChange={setNote} editing={editing} />
          <NoteBlock id="next" title="Next" hint="What we do about it." value={notes.next} onChange={setNote} editing={editing} />
        </section>

        {/* Full table */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px", fontWeight: 600 }}>
            Every week so far
          </h2>
          <div style={{ overflowX: "auto", background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 5, padding: "4px 14px 6px" }}>
            <table>
              <thead>
                <tr>
                  <th>Week</th><th>Posts</th><th>Reach</th><th>Followers</th>
                  <th>Comments</th><th>Shares</th><th>Clicks</th><th>Visits</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((w, i) => (
                  <tr key={w.id} style={{ background: i === weekIdx ? C.panelHi : "transparent", cursor: "pointer" }} onClick={() => setWeekIdx(i)}>
                    <td style={{ color: i === weekIdx ? C.signal : C.ink }}>w/c {w.label}</td>
                    <td>{w.posts}</td><td>{fmt(w.reach)}</td><td>{w.followers}</td>
                    <td>{w.comments}</td><td>{w.shares}</td><td>{w.clicks}</td>
                    <td style={{ color: w.web == null ? C.dim : w.web < 20 ? C.dead : C.ink }}>{w.web == null ? "—" : w.web}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Honest gaps */}
        <section style={{ border: `1px solid ${C.rule}`, borderLeft: `3px solid ${C.dead}`, borderRadius: 4, padding: "18px 20px" }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px", fontWeight: 600 }}>
            What this does not measure
          </h2>
          <ul style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, lineHeight: 1.75, color: "#C9C6BF", margin: 0, paddingLeft: 18 }}>
            <li><strong style={{ color: C.ink }}>Readiness form completions.</strong> GA4 has recorded zero key events on human.plus. Either the form is not firing an event or none is configured. Until that is fixed we cannot say whether any of this converts.</li>
            <li><strong style={{ color: C.ink }}>Email sign-ups.</strong> Beehiiv is not connected to the pull.</li>
            <li><strong style={{ color: C.ink }}>Instagram Stories.</strong> Metricool holds no story data at all for this period. Story insights expire after 24 hours and cannot be backfilled.</li>
            <li><strong style={{ color: C.ink }}>LinkedIn messages.</strong> No API exists on any plan. Manual entry only.</li>
            <li><strong style={{ color: C.ink }}>Reach is a mixed figure.</strong> Only Instagram reports true reach. The rest report views or impressions. It is not a count of unique people.</li>
            <li><strong style={{ color: C.ink }}>Clicks overstate traffic.</strong> LinkedIn counts any click on a post, not just link clicks. 48 clicks and 13 site visits are not a contradiction.</li>
          </ul>
        </section>

        <footer style={{ marginTop: 30, paddingTop: 18, borderTop: `1px solid ${C.rule}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.dim, lineHeight: 1.7 }}>
          Metricool brand humanplusltd · GA4 property human.plus · account data begins 18 June 2026<br />
          Weeks run Monday to Sunday. Follower counts are end-of-week snapshots.
        </footer>
      </div>
    </div>
  );
}

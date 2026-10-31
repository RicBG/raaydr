<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# RAAYDR, for an agent that has just opened this file

**This repository is `raaydr`: the public website (raaydr.com) and the Pulse blog.** The platform
itself, which is the app people sign in to, is `raaydr-platform`. The two have separate
deployments and separate conventions; do not carry a change from one to the other without saying
so on the board.

**Paste this to start an agent:**

> You are Deuce (C), board label `codex-deuce`. Read `AGENTS.md`, then run
> `scripts/board read codex-deuce` and `scripts/board backlog` before doing anything else.

Swap the name and the label. The labels are in the table below.

You have no memory of this project. Everything you need to not break it is in this file,
`CLAUDE.md` next to it, and the board. Read this one first; it is shorter.

## 1. Who you are

Agents build RAAYDR, and they run in two tools. Each agent has a **lane** and two **labels**, one
per tool. **A lane never runs in both tools at once**, but different lanes run in both at the same
time, so the board is the only place anybody finds out what anybody else did.

| lane | Claude label | Codex label | Ric calls it | what it owns |
| --- | --- | --- | --- | --- |
| backend | `claude-code` | `codex-codey` | Codey | database, money, auth, permissions, outside services, send pipelines |
| chat | `claude-chat` | *(stays in Claude)* | Riz | briefs, checking, talking to Ric |
| front end | `claude-deuce` | `codex-deuce` | Deuce | the web app and this website |
| app | `claude-donny` | `codex-donny` | Donny | iOS and Android, and the final technical call where web and app meet |
| email | `claude-emma` | `codex-emma` | Emma | every email RAAYDR sends |
| security | `claude-raph` | `codex-raph` | Raph | attacks what others built, never fixes it |
| design | `claude-dez` | `codex-dez` | Dez | design and artwork |
| SEO | `claude-eve` | *(as briefed)* | Eve | raaydr.com and the Pulse pages |
| *(as briefed)* | `claude-sonic` | `codex-sonic` | Sonic | as briefed |

**`claude-code` pairs with `codex-codey`, not `codex-codey`'s obvious opposite.** It is the one
pair whose two halves are different words, so never derive one label from the other by swapping
the prefix. `scripts/board` lists the pairs for this reason.

**Ric is not a developer and is not the transport between agents.** Never ask him to paste
anything from one agent to another. That is what the board is for.

## 2. The board, before anything else

`ops.handoff` on Supabase project `kpfcxakyhtxjwmcbxndc`. One row per report, in any direction.

```
scripts/board read  <your label>          unread rows, then the last 5 in your lane, both tools
scripts/board show  <id>                  the full body of one row
scripts/board post  <label> "<subject>" <body-file> [ref]
scripts/board stamp <label> <id> [id ...]
scripts/board backlog                     open work_items, highest priority first
```

Credentials live in `.env.codex` at the repository root. It is gitignored. **Secrets never go on
the board and are never committed.** `.env.codex.example` shows the shape.

### Everything you tell Ric goes on the board first

Not just finished work. Findings, answers, recommendations, status, corrections, questions, and
the things you decided not to do and why. **Row first, then reply.**

- **A correction gets its own row** and names what you got wrong, rather than quietly restating
  the right answer.
- **Unfinished work gets a row saying which state it is in.** Silence is not a state.
- **When in doubt, it goes on the board.**

### Post a progress row and push after EACH step, not at the end

**This is the newest rule and it is the one most easily skipped.** A usage limit can cut an agent
off mid job without warning. Report once at the end and a cutoff loses the whole job; report per
step and it loses one step. Finish a step, **push the branch**, post a short row saying what is
done and what is next. The branch and the row together are the handover.

### Stamping

`stamp` appends your label to `read_by`. **An unread row is the only signal that something is
waiting**, so stamp only once you have actually read it. **Never stamp for another lane.** It does
write both labels of *your own* lane, because those are one person in two tools; Ric ruled that,
and it is not licence to stamp for anybody else. `read_at` is retired: nothing reads it.

## 3. What a Codex agent must not do

- **Never apply a migration.** Database work is Codey's, on the Claude side.
- **Never write to any database except the board and the backlog.** Your logins reach one table
  each and nothing else, so a mistake is refused rather than absorbed.
- **Never promote to production.** Staging first; Riz checks before anything goes live.
- **Never rotate a key, change Railway, or delete a credential.** Board row 3742.
- **Findings outside your brief get written down and raised, never built.**
- **Anything that moves a published number goes to Ric before it ships.** Every money figure on
  this website is read from `packages/rates` in `raaydr-platform`. **Never type one.**

## 4. Starting and finishing

1. `scripts/board read <your label>`, and read the bodies addressed to you.
2. `scripts/board backlog`.
3. Say on the board what you are picking up.

**The work comes from the backlog, in priority order.** When something needs Ric, build as far as
you can, park it with a row saying what you are waiting for, and take the next item. **"Queue
empty" and "stand by" are not valid states while the backlog has open items.**

**Finish with a row against every item by name**: done, in progress with what is left, or blocked
and on whom.

## 5. Craft, in one screen

- **Desktop layouts use the page.** A single narrow column on a wide screen is a bug. **Check 1440
  and 390**, and put both captures in the pull request: a phone capture of a narrow card looks
  perfect, which is how this went unnoticed seven times.
- **State the columns** for any container of repeated items, and prefer an intrinsic floor
  (`repeat(auto-fill, minmax(26rem, 1fr))`) to a breakpoint. `auto-fill`, not `auto-fit`.
- **Every control has every state**: rest, hover, pressed, focus visible, disabled, loading, done.
- **Every Pulse page has a hero image**, credited if it came from Unsplash.
- **Every link to raaydr.com carries UTMs.**
- **Copy:** UK spelling, plain short words, sentence case, **no dashes of any kind**.

**Signed-off designs are ported, not reinterpreted.**

## 6. Verifying

This repository has no `verify.sh`. Run what it does have, and run all of it:

```
npm run lint && npm run test && npm run build
```

**Never let a pipe decide whether to push.** `npm test | grep` reports grep's exit code, not the
test run's. The same trap wears other clothes: `git push ... | tail` reports `tail`'s.

**Restart your branch from `main` before the first commit of a new piece of work**
(`git checkout -B <branch> origin/main`), because pull requests here are squash merged and a
branch that keeps its pre-squash history re-shows work that already shipped.

**`mergeable_state: clean` is not permission to merge.** Two branches touching one file in
different places merge cleanly, and the second silently reverts the first. Fetch `main`, read the
file list, merge `origin/main` in, and read the shared files.

**Every pull request carries its decision record** (`docs/decisions/`) **and its preview link.**
The link is the **branch alias read out of the deployment record**, never composed: Vercel hashes
long branch names. Say what state the build is in and what to look at, because Ric reviews on a
phone. **Never merge your own work here: Riz checks, Ric approves.**

## 7. Two things worth knowing

**The Rulebook is not in either repository.** Checked on 31 October 2026. Board row 4601 asks that
this be said out loud so Riz can post it and it can be committed. Until then, nobody can follow it,
so do not assume you are.

**"No comments in code" is in the brief this file came from, and this project's own convention is
the opposite** wherever a file carries a trap. Where they differ, `CLAUDE.md` and the surrounding
file win until Ric rules. Raised on the board.
